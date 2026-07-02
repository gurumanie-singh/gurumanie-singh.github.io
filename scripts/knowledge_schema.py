"""
Shared knowledge node schema helpers for pipeline scripts.

Canonical node fields are defined in data/knowledge-node.schema.json.
"""
from __future__ import annotations

import re
from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

NODE_TYPES = frozenset({
    "domain",
    "topic",
    "concept",
    "tool",
    "technique",
    "attack",
    "defense",
    "lab",
    "detection",
    "command",
    "case_study",
})

ROOT_TYPE = "root"
MAX_TREE_DEPTH = 5

LEGACY_TYPE_ALIASES = {
    "subtopic": "concept",
    "leaf": "concept",
}

# Top-level taxonomy (direct children of root)
TAXONOMY_DOMAINS: list[tuple[str, str]] = [
    ("fundamentals", "Fundamentals"),
    ("networks", "Networks"),
    ("systems", "Systems"),
    ("identity", "Identity"),
    ("web-security", "Web Security"),
    ("cloud-security", "Cloud Security"),
    ("detection-monitoring", "Detection & Monitoring"),
    ("offensive-security", "Offensive Security"),
    ("malware-re", "Malware & RE"),
    ("cryptography", "Cryptography"),
    ("governance-risk-compliance", "Governance/Risk/Compliance"),
    ("labs-ctfs", "Labs & CTFs"),
    ("tools", "Tools"),
    ("case-studies", "Case Studies"),
    ("career-interview-prep", "Career & Interview Prep"),
]

# Internal clustering buckets used during extract / assign_domain (legacy 12 domains)
OLD_CLUSTER_DOMAINS: list[tuple[str, str]] = [
    ("network-security", "Network Security"),
    ("web-security", "Web Security"),
    ("exploitation-vulnerability", "Exploitation & Vulnerability Research"),
    ("reconnaissance-osint", "Reconnaissance & OSINT"),
    ("cryptography", "Cryptography"),
    ("linux-cli", "Linux & CLI"),
    ("malware-threat", "Malware & Threat Analysis"),
    ("digital-forensics", "Digital Forensics"),
    ("cloud-infrastructure", "Cloud & Infrastructure Security"),
    ("software-code-security", "Software & Code Security"),
    ("intrusion-detection-monitoring", "Intrusion Detection & Monitoring"),
    ("incident-response", "Incident Response"),
]

# Map legacy cluster domain → new top-level taxonomy domain
OLD_TO_TAXONOMY: dict[str, str] = {
    "network-security": "networks",
    "web-security": "web-security",
    "exploitation-vulnerability": "offensive-security",
    "reconnaissance-osint": "offensive-security",
    "cryptography": "cryptography",
    "linux-cli": "systems",
    "malware-threat": "malware-re",
    "digital-forensics": "detection-monitoring",
    "cloud-infrastructure": "cloud-security",
    "software-code-security": "systems",
    "intrusion-detection-monitoring": "detection-monitoring",
    "incident-response": "detection-monitoring",
}

METADATA_DEFAULTS: dict[str, Any] = {
    "difficulty": "intermediate",
    "confidence": "decent",
    "relevance": "both",
    "cert_mapping": [],
    "last_updated": None,
}


def today_iso() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def default_metadata(**overrides: Any) -> dict[str, Any]:
    meta = {
        "difficulty": METADATA_DEFAULTS["difficulty"],
        "confidence": METADATA_DEFAULTS["confidence"],
        "relevance": METADATA_DEFAULTS["relevance"],
        "cert_mapping": list(METADATA_DEFAULTS["cert_mapping"]),
        "last_updated": today_iso(),
    }
    for key, value in overrides.items():
        if value is not None:
            meta[key] = value
    return meta


def infer_type_from_depth(depth: int, has_children: bool) -> str:
    if depth == 0:
        return ROOT_TYPE
    if depth == 1:
        return "domain"
    if depth == 2:
        return "topic" if has_children else "concept"
    return "concept"


def normalize_node_type(raw_type: str | None, depth: int, has_children: bool) -> str:
    if depth == 0:
        return ROOT_TYPE
    t = raw_type or infer_type_from_depth(depth, has_children)
    t = LEGACY_TYPE_ALIASES.get(t, t)
    if t == ROOT_TYPE:
        return ROOT_TYPE
    if t not in NODE_TYPES:
        return infer_type_from_depth(depth, has_children)
    if t == "topic" and not has_children and depth >= 2:
        return "concept"
    return t


def normalize_content_fields(record: dict[str, Any], *, is_leaf: bool) -> dict[str, Any]:
    """Map legacy detail → core_idea and ensure optional content fields exist on leaves."""
    if record.get("detail") and not record.get("core_idea"):
        record["core_idea"] = record["detail"]

    if not is_leaf:
        record.setdefault("children", [])
        return record

    record.setdefault("summary", "")
    record.setdefault("why_it_matters", "")
    record.setdefault("core_idea", record.get("detail") or "")
    record.setdefault("example_scenario", "")
    record.setdefault("detection_angle", "")
    record.setdefault("defensive_takeaway", "")
    record.setdefault("commands", [])
    record.setdefault("related", [])
    record.setdefault("tags", [])

    meta = default_metadata()
    existing = record.get("metadata") or {}
    if isinstance(existing, dict):
        meta.update({k: v for k, v in existing.items() if v is not None})
    record["metadata"] = meta
    return record


def finalize_topic_record(topic: dict[str, Any], *, depth: int = 2) -> dict[str, Any]:
    """
    Ensure a flat pipeline topic dict has schema fields before write.
    Flat topics are leaves at depth 2 under a domain.
    """
    t = dict(topic)
    has_children = bool(t.get("children"))
    t["type"] = normalize_node_type(t.get("type"), depth, has_children)
    normalize_content_fields(t, is_leaf=not has_children)
    return t


def is_content_leaf(node: dict[str, Any], has_children: bool) -> bool:
    if has_children:
        return False
    if node.get("type") in (ROOT_TYPE, "domain", "topic"):
        return False
    return True


def finalize_tree_node(node: dict[str, Any], depth: int = 0) -> dict[str, Any]:
    """Recursively normalize a nested root-tree node."""
    n = dict(node)
    children = [finalize_tree_node(c, depth + 1) for c in n.get("children") or []]
    n["children"] = children
    has_children = len(children) > 0
    n["type"] = normalize_node_type(n.get("type"), depth, has_children)
    normalize_content_fields(n, is_leaf=is_content_leaf(n, has_children))
    return n


def derive_label(title: str, max_words: int = 4) -> str:
    if not title:
        return ""
    t = re.sub(r"\([^)]*\)", "", title)
    t = re.split(r"\s*[—–-]\s*.+$", t)[0].strip()
    words = [w for w in t.split() if w]
    skip = {"the", "a", "an"}
    while words and words[0].lower() in skip:
        words.pop(0)
    return " ".join(words[:max_words])


def tree_depth(node: dict[str, Any], depth: int = 0) -> int:
    children = node.get("children") or []
    if not children:
        return depth
    return max(tree_depth(child, depth + 1) for child in children)


def flat_topic_to_node(topic: dict[str, Any], depth: int = 3) -> dict[str, Any]:
    """Convert a flat pipeline topic dict into a nested tree leaf node."""
    t = finalize_topic_record(dict(topic), depth=depth)
    node: dict[str, Any] = {
        "id": t["topicId"],
        "title": t["title"],
        "label": t.get("label") or derive_label(t["title"]),
        "type": t.get("type", "concept"),
        "tags": t.get("tags", []),
        "summary": t.get("summary", ""),
        "why_it_matters": t.get("why_it_matters", ""),
        "core_idea": t.get("core_idea") or t.get("detail", ""),
        "example_scenario": t.get("example_scenario", ""),
        "detection_angle": t.get("detection_angle", ""),
        "defensive_takeaway": t.get("defensive_takeaway", ""),
        "commands": t.get("commands", []),
        "related": t.get("related", []),
        "metadata": t.get("metadata"),
        "sources": t.get("sources"),
        "sourceType": t.get("sourceType"),
        "children": [],
    }
    return finalize_tree_node(node, depth=depth)


def tree_node_to_flat_topic(node: dict[str, Any]) -> dict[str, Any]:
    """Flatten a tree leaf back into a pipeline topic dict."""
    t = dict(node)
    t["topicId"] = node["id"]
    if t.get("core_idea") and not t.get("detail"):
        t["detail"] = t["core_idea"]
    return t


def extract_cluster_buckets(raw: dict[str, Any]) -> dict[str, list[dict]]:
    """Read cluster buckets from either legacy domains[] or nested root tree."""
    buckets: dict[str, list[dict]] = {old_id: [] for old_id, _ in OLD_CLUSTER_DOMAINS}

    if raw.get("domains"):
        for dom in raw["domains"]:
            did = dom.get("domainId")
            if did in buckets:
                buckets[did] = list(dom.get("topics", []))
        return buckets

    root = raw.get("root")
    if not root:
        return buckets

    for tax_domain in root.get("children", []):
        for group in tax_domain.get("children", []):
            gid = group.get("id")
            if gid not in buckets:
                continue
            for leaf in group.get("children", []):
                buckets[gid].append(tree_node_to_flat_topic(leaf))
    return buckets


def build_knowledge_document(
    cluster_buckets: dict[str, list[dict]],
    *,
    category: str = "Cybersecurity",
    last_built: str | None = None,
) -> dict[str, Any]:
    """
    Build nested root tree from legacy cluster buckets.

    Depth model (max 5):
      0 root → 1 taxonomy domain → 2 legacy domain group → 3 concept leaf
    """
    old_name_by_id = dict(OLD_CLUSTER_DOMAINS)
    taxonomy_groups: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for old_id, _old_name in OLD_CLUSTER_DOMAINS:
        topics = cluster_buckets.get(old_id, [])
        if not topics:
            continue

        seen_ids: set[str] = set()
        leaf_nodes: list[dict[str, Any]] = []
        for topic in topics:
            tid = topic.get("topicId") or topic.get("id") or derive_label(topic.get("title", "topic"))
            unique = tid
            n = 2
            while unique in seen_ids:
                unique = f"{tid}-{n}"
                n += 1
            topic = dict(topic)
            topic["topicId"] = unique
            seen_ids.add(unique)
            leaf_nodes.append(flat_topic_to_node(topic, depth=3))

        new_tax_id = OLD_TO_TAXONOMY[old_id]
        group_node = {
            "id": old_id,
            "title": old_name_by_id[old_id],
            "label": derive_label(old_name_by_id[old_id]),
            "type": "topic",
            "icon": old_id,
            "summary": f"{len(leaf_nodes)} notes from the legacy {old_name_by_id[old_id]} collection.",
            "children": leaf_nodes,
        }
        taxonomy_groups[new_tax_id].append(finalize_tree_node(group_node, depth=2))

    root_children: list[dict[str, Any]] = []
    for tax_id, tax_name in TAXONOMY_DOMAINS:
        groups = taxonomy_groups.get(tax_id, [])
        note_count = sum(len(g.get("children", [])) for g in groups)
        if groups:
            summary = f"{note_count} notes across {len(groups)} section(s)."
        else:
            summary = "No content yet — reserved for future notes."

        domain_node = {
            "id": tax_id,
            "title": tax_name,
            "label": derive_label(tax_name),
            "type": "domain",
            "icon": tax_id,
            "summary": summary,
            "children": groups,
        }
        root_children.append(finalize_tree_node(domain_node, depth=1))

    root = finalize_tree_node({
        "id": slugify_category(category),
        "title": category,
        "label": derive_label(category),
        "type": ROOT_TYPE,
        "children": root_children,
    }, depth=0)

    if tree_depth(root) > MAX_TREE_DEPTH:
        raise ValueError(
            f"Knowledge tree depth {tree_depth(root)} exceeds MAX_TREE_DEPTH ({MAX_TREE_DEPTH})"
        )

    return {
        "category": category,
        "lastBuilt": last_built or datetime.now(timezone.utc).isoformat(),
        "root": root,
    }


def slugify_category(category: str) -> str:
    s = category.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "knowledge"


def taxonomy_mapping_table() -> str:
    """Human-readable mapping table for review."""
    lines = [
        "| Legacy cluster ID | Legacy name | New taxonomy ID | New taxonomy name |",
        "|---|---|---|---|",
    ]
    old_names = dict(OLD_CLUSTER_DOMAINS)
    tax_names = dict(TAXONOMY_DOMAINS)
    for old_id, old_name in OLD_CLUSTER_DOMAINS:
        new_id = OLD_TO_TAXONOMY[old_id]
        lines.append(f"| `{old_id}` | {old_name} | `{new_id}` | {tax_names[new_id]} |")
    empty = [tid for tid, _ in TAXONOMY_DOMAINS if tid not in set(OLD_TO_TAXONOMY.values())]
    if empty:
        lines.append("")
        lines.append("**New taxonomy domains with no legacy mapping yet:**")
        for tid in empty:
            lines.append(f"- `{tid}` — {tax_names[tid]}")
    return "\n".join(lines)

