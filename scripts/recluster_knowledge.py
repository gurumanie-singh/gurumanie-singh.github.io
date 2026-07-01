#!/usr/bin/env python3
"""
Re-cluster data/cybersecurity.json from classes → domains.
Reads category/classes/topics, outputs category/domains/topics.
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IN_PATH = ROOT / "data" / "cybersecurity.json"
OUT_PATH = IN_PATH

DOMAINS = [
    ("network-security", "Network Security", "🌐"),
    ("web-security", "Web Security", "🕸️"),
    ("exploitation-vulnerability", "Exploitation & Vulnerability Research", "💥"),
    ("reconnaissance-osint", "Reconnaissance & OSINT", "🔍"),
    ("cryptography", "Cryptography", "🔐"),
    ("linux-cli", "Linux & CLI", "🐧"),
    ("malware-threat", "Malware & Threat Analysis", "🦠"),
    ("digital-forensics", "Digital Forensics", "🔬"),
    ("cloud-infrastructure", "Cloud & Infrastructure Security", "☁️"),
    ("software-code-security", "Software & Code Security", "🛡️"),
    ("intrusion-detection-monitoring", "Intrusion Detection & Monitoring", "📡"),
    ("incident-response", "Incident Response", "🚨"),
]

DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "network-security": [
        "tcp", "udp", "ip", "dns", "dhcp", "arp", "routing", "packet", "wireshark",
        "firewall", "vpn", "ethernet", "protocol", "osi", "subnet", "vlan", "nat",
        "icmp", "syn", "handshake", "port", "socket", "bandwidth", "crc", "manchester",
        "transport layer", "network layer", "data link", "physical layer", "gbn",
        "congestion", "ttl", "traceroute", "telnet", "smtp", "imap", "ftp",
        "iptables", "nginx", "apache", "slowloris", "denial of service", "dos",
        "wireless", "802.11", "wifi", "ethernet", "kerberos overview", "clientserver",
    ],
    "web-security": [
        "http", "https", "sql injection", "xss", "csrf", "owasp", "web app",
        "web security", "login.php", "cookie", "session", "html", "javascript",
        "cross-site", "injection", "web server", "mitigation", "nginx", "apache",
        "module08-web", "web.md",
    ],
    "exploitation-vulnerability": [
        "buffer overflow", "memory safety", "shellcode", "cve", "reverse engineering",
        "exploit", "overflow", "stack", "heap", "rop", "gadget", "vulnerability",
        "penetration", "break-in", "privilege escalation", "sudo", "backdoor",
    ],
    "reconnaissance-osint": [
        "recon", "nmap", "scan", "enumeration", "footprint", "osint", "whois",
        "nslookup", "ping sweep", "port scan", "passive", "fingerprint", "banner",
        "host discovery", "stealth", "syn scan", "fping", "zone transfer",
    ],
    "cryptography": [
        "crypto", "cryptograph", "encrypt", "decrypt", "hash", "pki", "tls",
        "certificate", "rsa", "aes", "symmetric", "asymmetric", "kerberos",
        "digital signature", "ssl", "diffie-hellman", "authentication protocol",
        "module02-intro", "cryptography tools",
    ],
    "linux-cli": [
        "linux", "bash", "shell", "bandit", "overthewire", "chmod", "grep", "find",
        "ssh", "cat ", "ls ", "cd ", "file permission", "cli", "command line",
        "level 0", "level 1", "level 2", "level 3", "level 4", "level 5",
        "level 6", "level 7", "level 8", "level 9", "level 10", "level 11",
        "level 12", "level 13", "ctf",
    ],
    "malware-threat": [
        "malware", "virus", "worm", "trojan", "ransomware", "ioc", "indicator",
        "threat", "adversary", "mitre", "att&ck", "attack", "honeybee", "whitefly",
        "cherryblos", "malicious software", "denial of service attack",
        "module03-cyber", "module04-ethics", "adversarial",
    ],
    "digital-forensics": [
        "forensic", "evidence", "disk imaging", "chain of custody", "memory dump",
        "log analysis", "cpre536", "forensics", "investigation", "artifact",
        "term paper", "project-3", "enCase", "ftk", "hash value",
    ],
    "cloud-infrastructure": [
        "aws", "iam", "cloudtrail", "cloudwatch", "ec2", "s3", "cloud security",
        "azure", "gcp", "infrastructure", "kubernetes", "container",
        "wireless_lot_and_cloud", "cloudsecurity", "cloud computing",
        "wifi", "802.11", "wireless lab", "ara wireless", "cellular network",
        "5 ghz", "2.4 ghz", "access point", "iot", "sdn", "nfV",
    ],
    "software-code-security": [
        "safety", "hazard", "fault tree", "iec 61508", "coms415", "secure coding",
        "code review", "sfmeca", "safeware", "fault tolerance", "certification",
        "software system safety", "mars lander", "formal method",
    ],
    "intrusion-detection-monitoring": [
        "ids", "ips", "siem", "sigma", "alert", "anomaly", "snort", "intrusion",
        "detection system", "monitoring", "module11-ids", "module10-firewall",
        "firewall", "suricata", "log",
    ],
    "incident-response": [
        "incident response", "containment", "eradication", "recovery", "reporting",
        "ir process", "breach", "remediation", "executive summary", "issues identified",
        "attack narrative", "recommendation", "break-in lab", "penetration test report",
        "phase 1", "phase 2", "vulnerability assessment report",
    ],
}

CLASS_DOMAIN_BIAS: dict[str, str] = {
    "coms415": "software-code-security",
    "cpre536": "digital-forensics",
    "nmap-notes": "reconnaissance-osint",
    "overthewire": "linux-cli",
}

CLASS_CODE_MAP = {
    "coms415": "COMS415",
    "cpre430": "CPRE430",
    "cpre431": "CPRE431",
    "cpre489": "CPRE489",
    "cpre532": "CPRE532",
    "cpre536": "CPRE536",
    "nmap-notes": "nmap-notes",
    "overthewire": "overthewire-solutions",
}


def normalize_title(title: str) -> str:
    t = title.lower()
    t = re.sub(r"^(coms\s*\d+|cpre\s*\d+|bandit level \d+)\s*[—–-]\s*", "", t)
    t = re.sub(r"^(coms\d+|cpre\d+)\s*[—–-]\s*", "", t)
    t = re.sub(r"^bandit level \d+\s*[—–-]\s*", "", t)
    t = re.sub(r"[🛠🔍🚀🔗].*", "", t)
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-+", "-", text)[:70] or "topic"


def score_domain(domain_id: str, topic: dict, class_id: str, corpus: str) -> float:
    score = 0.0
    keywords = DOMAIN_KEYWORDS.get(domain_id, [])
    for kw in keywords:
        if kw in corpus:
            score += 2.0 if " " in kw else 1.0
    for tag in topic.get("tags", []):
        tag_l = tag.lower()
        for kw in keywords:
            if kw in tag_l or tag_l in kw:
                score += 3.0
    if CLASS_DOMAIN_BIAS.get(class_id) == domain_id:
        score += 1.5
    # class-specific nudges
    if class_id == "cpre430" and domain_id == "network-security":
        score += 2.0
    if class_id == "cpre489" and domain_id == "network-security":
        score += 1.5
    if class_id == "cpre431" and domain_id in ("cryptography", "intrusion-detection-monitoring", "web-security"):
        score += 0.5
    if class_id == "cpre532" and domain_id in ("reconnaissance-osint", "malware-threat", "incident-response"):
        score += 0.5
    return score


def assign_domain(topic: dict, class_id: str) -> str:
    # Strong class signals override ambiguous tag matches
    if class_id == "coms415":
        return "software-code-security"
    if class_id == "cpre536":
        return "digital-forensics"
    if class_id == "nmap-notes":
        return "reconnaissance-osint"
    if class_id == "overthewire":
        return "linux-cli"

    title = topic.get("title", "")
    summary = topic.get("summary", "")
    detail = (topic.get("detail") or "")[:800]
    tags = " ".join(topic.get("tags", []))
    corpus = f"{title} {summary} {tags} {detail}".lower()

    # Explicit high-priority phrase routing
    if any(k in corpus for k in ("executive summary", "attack narrative", "remediat", "recommendation", "issues identified", "break-in lab writeup")):
        return "incident-response"
    if any(k in corpus for k in ("cloud computing", "cloud security", "aws", "iam", "cloudtrail", "s3 bucket", "ec2", "iot cloud", "ara wireless", "802.11", "wifi access point", "5 ghz", "2.4 ghz", "cellular network")):
        if "cryptograph" not in corpus[:200]:
            return "cloud-infrastructure"

    scores = {d[0]: score_domain(d[0], topic, class_id, corpus) for d in DOMAINS}
    best = max(scores, key=scores.get)
    if scores[best] <= 0:
        best = CLASS_DOMAIN_BIAS.get(class_id, "network-security")
        topic.setdefault("tags", [])
        if "unreviewed" not in topic["tags"]:
            topic["tags"] = list(topic["tags"]) + ["unreviewed"]
    return best


def title_similarity(a: str, b: str) -> float:
    na, nb = normalize_title(a), normalize_title(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 1.0
    return SequenceMatcher(None, na, nb).ratio()


def merge_topics(a: dict, b: dict) -> dict:
    """Merge b into a, return merged topic."""
    # prefer longer summary/detail
    if len(b.get("summary", "")) > len(a.get("summary", "")):
        a["summary"] = b["summary"]
    if len(b.get("detail", "")) > len(a.get("detail", "")):
        a["detail"] = b["detail"]
    elif len(b.get("detail", "")) == len(a.get("detail", "")) and b.get("detail"):
        if b["detail"] != a.get("detail"):
            a["detail"] = (a.get("detail", "") + "\n\n---\n\n" + b["detail"])[:8000]

    # shorter cleaner title
    if len(b.get("title", "")) < len(a.get("title", "")) and len(b["title"]) > 10:
        a["title"] = b["title"]

    # merge tags
    tags = list(dict.fromkeys((a.get("tags") or []) + (b.get("tags") or [])))
    a["tags"] = [t for t in tags if t != "unreviewed"] or tags

    # merge commands
    cmds: dict[str, dict] = {}
    for c in (a.get("commands") or []) + (b.get("commands") or []):
        if c and c.get("cmd"):
            key = c["cmd"].strip()
            if key not in cmds:
                cmds[key] = c
            elif len(c.get("explain", "")) > len(cmds[key].get("explain", "")):
                cmds[key]["explain"] = c["explain"]
    if cmds:
        a["commands"] = list(cmds.values())
    elif "commands" in a:
        del a["commands"]

    # merge sources metadata
    a_sources = set(a.get("sources") or [])
    a_sources.update(b.get("sources") or [])
    a["sources"] = sorted(a_sources)

    a_files = list(dict.fromkeys((a.get("sourceFiles") or []) + (b.get("sourceFiles") or [])))
    a["sourceFiles"] = a_files

    a_classes = list(dict.fromkeys((a.get("classCodes") or []) + (b.get("classCodes") or [])))
    a["classCodes"] = a_classes

    return a


def dedupe_topics(topics: list[dict]) -> tuple[list[dict], int]:
    merged_count = 0
    result: list[dict] = []
    used = [False] * len(topics)

    for i, ti in enumerate(topics):
        if used[i]:
            continue
        current = dict(ti)
        for j in range(i + 1, len(topics)):
            if used[j]:
                continue
            tj = topics[j]
            sim = title_similarity(ti["title"], tj["title"])
            # also check if normalized titles share significant overlap
            na, nb = normalize_title(ti["title"]), normalize_title(tj["title"])
            word_overlap = len(set(na.split()) & set(nb.split())) / max(len(set(na.split()) | set(nb.split())), 1)
            if sim >= 0.82 or (word_overlap >= 0.7 and len(na) > 15):
                current = merge_topics(current, tj)
                used[j] = True
                merged_count += 1
        result.append(current)

    return result, merged_count


def main():
    if not IN_PATH.exists():
        raise SystemExit(f"Missing {IN_PATH}")

    raw = json.loads(IN_PATH.read_text(encoding="utf-8"))
    domain_buckets: dict[str, list[dict]] = {d[0]: [] for d in DOMAINS}
    merge_log: dict[str, list[str]] = defaultdict(list)

    # Accept legacy classes schema or re-run on existing domains schema
    if "domains" in raw and "classes" not in raw:
        class_iter = []
        for dom in raw["domains"]:
            for topic in dom.get("topics", []):
                codes = topic.get("classCodes") or topic.get("sources") or ["unknown"]
                class_id = next(
                    (k for k, v in CLASS_CODE_MAP.items() if v in codes or k in codes),
                    codes[0].lower().replace(" ", "").replace("-solutions", ""),
                )
                class_iter.append({
                    "classId": class_id,
                    "classCode": codes[0],
                    "topics": [topic],
                })
        classes = class_iter
    else:
        classes = raw.get("classes", [])

    for cls in classes:
        class_id = cls.get("classId", "")
        class_code = cls.get("classCode", CLASS_CODE_MAP.get(class_id, class_id))
        short_code = CLASS_CODE_MAP.get(class_id, class_code.replace(" ", ""))

        for topic in cls.get("topics", []):
            t = dict(topic)
            t["classCodes"] = [short_code]
            t["sources"] = [short_code]
            if "sourceFiles" not in t:
                t["sourceFiles"] = []
            domain_id = assign_domain(t, class_id)
            domain_buckets[domain_id].append(t)

    output_domains = []
    total_before = sum(len(v) for v in domain_buckets.values())
    total_after = 0
    total_merged = 0

    for domain_id, domain_name, icon in DOMAINS:
        topics = domain_buckets[domain_id]
        before = len(topics)
        topics, merged = dedupe_topics(topics)
        total_merged += merged
        total_after += len(topics)

        # clean topic ids
        seen_ids: set[str] = set()
        for t in topics:
            base = slugify(normalize_title(t["title"]) or t["topicId"])
            tid = base
            n = 2
            while tid in seen_ids:
                tid = f"{base}-{n}"
                n += 1
            t["topicId"] = tid
            seen_ids.add(tid)
            # remove old class-prefixed ids clutter
            if "classCodes" in t and len(t["classCodes"]) > 1:
                merge_log[domain_name].append("+".join(t["classCodes"]))

        output_domains.append({
            "domainId": domain_id,
            "domainName": domain_name,
            "icon": icon,
            "topics": topics,
        })

        merge_note = ""
        if merged:
            merge_note = f" (merged {merged} duplicates)"
        print(f"{domain_name}: {len(topics)} topics{merge_note}.")

    out = {"category": raw.get("category", "Cybersecurity"), "domains": output_domains}
    OUT_PATH.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nFinal: {len(output_domains)} domains, {total_after} topics after deduplication "
          f"(from {total_before} pre-merge assignments, {total_merged} merges).")
    for d in output_domains:
        print(f"  {d['domainName']}: {len(d['topics'])}")


if __name__ == "__main__":
    main()
