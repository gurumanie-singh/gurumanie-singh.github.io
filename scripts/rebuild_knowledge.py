#!/usr/bin/env python3
"""
Full rebuild: extract → synthesize → Claude augment → cluster → validate → write.
"""
from __future__ import annotations

import json
import os
import re
import sys
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from knowledge_schema import (  # noqa: E402
    OLD_CLUSTER_DOMAINS,
    build_knowledge_document,
    extract_cluster_buckets,
    finalize_topic_record,
)
from build_knowledge import (  # noqa: E402
    CLASS_META,
    EXTRACT_DIR,
    FOLDER_ORDER,
    TESSERACT_OK,
    extract_commands_from_text,
    first_sentence,
    infer_tags,
    setup_tesseract,
    slugify,
    should_skip,
    ocr_image,
    extract_html,
    extract_doc,
    extract_odt,
    extract_pptx,
    extract_svg,
    extract_c_comments,
    BINARY_NO_EXT,
)

OUT_PATH = ROOT / "data" / "cybersecurity.json"
LOG_PATH = ROOT / "rebuild-progress.log"
MODEL = "claude-sonnet-4-6"

DOMAINS = list(OLD_CLUSTER_DOMAINS)

NETWORK_SECURITY_CAP = 80
DOMAIN_TOPIC_FLOOR = {
    "incident-response": 15,
    "cloud-infrastructure": 15,
    "software-code-security": 15,
}

# Protocol families for merging related network subsections
PROTOCOL_FAMILIES: dict[str, list[str]] = {
    "tcp": ["tcp", "transmission control"],
    "udp": ["udp", "user datagram"],
    "ip": ["ipv4", "ipv6", "internet protocol", "ip header", "ip datagram"],
    "dns": ["dns", "domain name system"],
    "dhcp": ["dhcp", "dynamic host"],
    "arp": ["arp", "address resolution"],
    "icmp": ["icmp", "internet control message"],
    "ethernet": ["ethernet", "mac address", "802.3"],
    "vlan": ["vlan", "802.1q"],
    "ospf": ["ospf"],
    "bgp": ["bgp", "border gateway"],
    "smtp": ["smtp"],
    "ftp": ["ftp"],
    "tls": ["tls record", "tls handshake"],
    "wifi": ["802.11", "wifi", "wi-fi", "wireless lan"],
    "osi": ["osi model", "osi layer"],
    "routing": ["routing protocol", "routing table", "static route"],
    "nat": ["network address translation", "nat ", " pat "],
    "gbn": ["go-back-n", "go back n", "gbn"],
    "sr": ["selective repeat"],
}

STANDALONE_NETWORK_TOPICS = (
    "arp spoofing", "arp cache poison", "three-way handshake", "syn scan", "syn flood",
    "dhcp starvation", "dns zone transfer", "vlan hopping", "wireshark", "iptables",
    "firewall", "vpn", "mitm", "man-in-the-middle", "port scan", "traceroute",
    "ping flood", "icmp redirect", "osi model", "go-back-n", "selective repeat",
    "manchester encoding", "packet sniffing", "network segmentation", "subnetting",
    "nat traversal", "syn-ack", "half-open",
)

MERGEABLE_ASPECTS = (
    "header", "headers", "flags", "flag", "window", "windowing", "flow control",
    "congestion", "checksum", "options", "fields", "format", "structure",
    "segments", "segment", "acknowledgment", "sequence", "ports", "introduction",
    "overview", "basics", "fundamentals", "mechanism", "mechanisms", "operation",
    "reliability", "multiplexing", "demultiplexing", "framing", "addressing",
)

DOMAIN_KEYWORDS: dict[str, list[str]] = {
    "network-security": [
        "tcp", "udp", "ip", "dns", "dhcp", "arp", "routing", "vlan", "packet", "wireshark",
        "firewall", "vpn", "protocol", "ethernet", "icmp", "syn", "handshake", "osi",
        "subnet", "nat", "traceroute", "smtp", "telnet", "iptables", "congestion", "crc",
        "transport layer", "network layer", "socket", "gbn", "manchester",
    ],
    "web-security": [
        "http", "https", "cookie", "session", "sql injection", "sqli", "xss", "csrf", "ssrf",
        "owasp", "web app", "login.php", "cross-site", "web server",
    ],
    "exploitation-vulnerability": [
        "buffer overflow", "shellcode", "rop", "heap", "stack", "memory corruption", "cve",
        "exploit", "binary", "privilege escalation", "reverse engineering", "rowhammer",
        "spectre", "meltdown",
    ],
    "reconnaissance-osint": [
        "nmap", "recon", "footprint", "enumeration", "osint", "whois", "nslookup",
        "port scan", "fingerprint", "shodan", "host discovery", "stealth", "syn scan",
    ],
    "cryptography": [
        "crypto", "encrypt", "decrypt", "hash", "pki", "tls", "ssl", "certificate", "rsa",
        "aes", "kerberos", "diffie-hellman", "cipher", "digital signature",
    ],
    "linux-cli": [
        "linux", "bash", "shell", "bandit", "chmod", "grep", "find", "ssh", "privilege",
        "file permission", "overthewire", "level 0", "level 1", "level 2",
    ],
    "malware-threat": [
        "malware", "virus", "worm", "trojan", "ransomware", "ioc", "yara", "sandbox",
        "threat intel", "mitre", "att&ck", "adversary", "malicious software",
    ],
    "digital-forensics": [
        "forensic", "evidence", "disk imaging", "file carving", "chain of custody",
        "memory forensics", "timeline", "cpre536", "artifact", "investigation",
    ],
    "cloud-infrastructure": [
        "aws", "iam", "cloudtrail", "cloudwatch", "ec2", "s3", "vpc", "cloud",
        "container", "kubernetes", "misconfiguration", "802.11", "wifi", "wireless",
    ],
    "software-code-security": [
        "safety", "hazard", "fault tree", "iec 61508", "secure coding", "sast", "dast",
        "code review", "input validation", "dependency", "coms415", "fault tolerance",
    ],
    "intrusion-detection-monitoring": [
        "ids", "ips", "siem", "sigma", "snort", "suricata", "zeek", "anomaly",
        "alert", "intrusion detection", "monitoring",
    ],
    "incident-response": [
        "incident response", "containment", "eradication", "recovery", "playbook",
        "tabletop", "breach", "remediation", "executive summary", "attack narrative",
    ],
}

CLASS_BIAS = {
    "coms415": "software-code-security",
    "cpre536": "digital-forensics",
    "nmap-notes": "reconnaissance-osint",
    "overthewire": "linux-cli",
    "cpre430": "network-security",
}

SOURCE_CODE = {k: v["classCode"].replace(" ", "") for k, v in CLASS_META.items()}
SOURCE_CODE["overthewire"] = "overthewire-solutions"
SOURCE_CODE["nmap-notes"] = "nmap-notes"


def extract_pdf_pdfplumber(path: Path) -> tuple[str | None, str]:
    try:
        import pdfplumber
        parts = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    parts.append(t.strip())
        text = "\n\n".join(parts).strip()
        if len(text) >= 50:
            return text, "pdfplumber"
        return None, "PDF has no extractable text layer"
    except Exception as e:
        return None, f"pdfplumber failed: {e}"


def extract_docx_mammoth(path: Path) -> tuple[str | None, str]:
    try:
        import mammoth
        with open(path, "rb") as f:
            result = mammoth.extract_raw_text(f)
        text = (result.value or "").strip()
        return (text, "mammoth") if text else (None, "empty docx")
    except Exception as e:
        return None, f"mammoth failed: {e}"


def extract_file_rebuild(path: Path, folder: str) -> tuple[str | None, str, str]:
    skip, reason = should_skip(path)
    if skip:
        return None, "skip", reason
    ext = path.suffix.lower()
    if ext in {".md", ".txt"}:
        try:
            return path.read_text(encoding="utf-8", errors="replace").strip(), "direct read", ""
        except Exception as e:
            return None, "skip", str(e)
    if ext == ".html":
        t, m = extract_html(path)
        return t, m, m if not t else ""
    if ext == ".pdf":
        t, m = extract_pdf_pdfplumber(path)
        if not t and TESSERACT_OK:
            try:
                import fitz
                import pytesseract
                from PIL import Image
                doc = fitz.open(path)
                ocr_parts = []
                for page in doc:
                    pix = page.get_pixmap(dpi=150)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    ocr_parts.append(pytesseract.image_to_string(img))
                text = "\n\n".join(ocr_parts).strip()
                if len(text) >= 50:
                    return text, "pytesseract OCR", ""
            except Exception:
                pass
        return t, m, m if not t else ""
    if ext == ".docx":
        t, m = extract_docx_mammoth(path)
        return t, m, m if not t else ""
    if ext == ".doc":
        t, m = extract_doc(path)
        return t, m, m if not t else ""
    if ext == ".odt":
        t, m = extract_odt(path)
        return t, m, m if not t else ""
    if ext == ".pptx":
        t, m = extract_pptx(path)
        return t, m, m if not t else ""
    if ext == ".png":
        t, m = ocr_image(path)
        return t, m, m if not t else ""
    if ext == ".svg":
        t, m = extract_svg(path)
        return t, m, m if not t else ""
    if ext == ".xml":
        try:
            return path.read_text(encoding="utf-8", errors="replace").strip(), "xml read", ""
        except Exception as e:
            return None, "skip", str(e)
    if ext == ".py":
        try:
            raw = path.read_text(encoding="utf-8", errors="replace")
            docstrings = re.findall(r'"""(.*?)"""', raw, re.S) + re.findall(r"'''(.*?)'''", raw, re.S)
            comments = re.findall(r"#[^\n]*", raw)
            text = "\n".join(docstrings + comments + [raw[:4000]]).strip()
            return text, "python read", ""
        except Exception as e:
            return None, "skip", str(e)
    if ext in {".c", ".h"}:
        t, m = extract_c_comments(path)
        return t, m, m if not t else ""
    if not ext and path.name.lower() in BINARY_NO_EXT:
        return None, "skip", "binary executable"
    return None, "skip", f"unrecognized format ({ext or 'no ext'})"

ADMIN_RE = re.compile(
    r"canvas|gradescope|late homework|assignments will be submitted|turn in on|"
    r"attendance policy|grading rubric|syllabus|due by \d|submit your homework|"
    r"pdf format only|not allowed to use ai tools",
    re.I,
)
BAD_TITLE_RE = re.compile(
    r"^(M0?\d\s*HW|Module\s*\d+|Lab\s*\d+\s*$|CPRE\s*\d{4}|Quiz\s*\d|"
    r"SE\s*\d+\s*Assignment\s*\d|Screenshot\s*—|🛠|🔍|🚀|🔗)",
    re.I,
)
LEAK_TITLE_RE = re.compile(r"M0\d|HW\b|Quiz\d|Module \d|CPRE \d{4}|Lab \d", re.I)
ADMIN_SUMMARY_RE = re.compile(r"canvas|submitted|homework|assignment", re.I)

NMAP_CURATED = [
    {
        "title": "Nmap — Host Discovery & Skip-Ping",
        "tags": ["nmap", "recon", "network"],
        "summary": "-Pn skips host discovery when the target is known up. Default discovery mixes ICMP echo, TCP SYN to 443, ACK to 80, and ICMP timestamp.",
        "detail": "Use **-Pn** when ICMP is blocked but services respond. Root required for raw SYN scans (-sS), not for connect scans (-sT).",
        "commands": [
            {"cmd": "nmap -Pn 192.168.1.1", "explain": "Skip host discovery"},
            {"cmd": "nmap -sn 192.168.1.0/24", "explain": "Ping sweep only"},
        ],
    },
    {
        "title": "Nmap — Stealth SYN Scan",
        "tags": ["nmap", "recon", "tcp"],
        "summary": "-sS sends SYN without completing the handshake. Faster than full connect, historically harder to log. Requires root.",
        "detail": "Half-open scanning sends SYN, waits for SYN-ACK, then RST instead of ACK — avoids full connection logs on many systems.",
        "commands": [
            {"cmd": "nmap -sS -p- <target>", "explain": "Full TCP port range stealth scan"},
            {"cmd": "nmap -sS -T4 <target>", "explain": "Default 1000 ports, faster timing"},
        ],
    },
    {
        "title": "Nmap — Port Selection Syntax",
        "tags": ["nmap", "recon"],
        "summary": "-p accepts single ports, ranges, lists, UDP (U:), and -p- for all 65535 ports.",
        "detail": "Combine TCP and UDP: `-p 1:22,U:53`. `--top-ports N` limits to common ports.",
        "commands": [
            {"cmd": "nmap 1.2.3.4 -p 80,22,443", "explain": "Specific port list"},
            {"cmd": "nmap 1.2.3.4 -p-", "explain": "All ports"},
            {"cmd": "nmap -iL hosts.txt", "explain": "Targets from file"},
        ],
    },
    {
        "title": "Nmap — Service & OS Detection",
        "tags": ["nmap", "enumeration"],
        "summary": "-sV probes banners for version. -O fingerprints the TCP/IP stack. -A bundles aggressive detection plus default scripts.",
        "detail": "NSE scripts live in `/usr/share/nmap/scripts`. Run with `--script <name>`.",
        "commands": [
            {"cmd": "nmap -sV 1.2.3.4", "explain": "Service version detection"},
            {"cmd": "nmap -O 1.2.3.4", "explain": "OS fingerprinting"},
            {"cmd": "nmap -A 1.2.3.4", "explain": "Aggressive scan bundle"},
        ],
    },
]

logs: list[str] = []
folder_stats: dict[str, dict] = {}
api_failures: list[str] = []
augment_mode: str = "none"  # none | offline | api | mixed
source_type_counts: dict[str, int] = defaultdict(int)


def log(msg: str) -> None:
    logs.append(msg)
    print(msg, flush=True)


def clean_title(title: str) -> str:
    t = re.sub(r"^[🛠🔍🚀🔗]\s*", "", title)
    t = re.sub(r"^(COMS\s*\d+|CPRE\s*\d+)\s*[—–-]\s*", "", t, flags=re.I)
    t = re.sub(r"^(M0?\d\s*HW|Module\s*\d+[:\s]*|Lab\s*\d+[:\s]*|Quiz\s*\d+[:\s]*)", "", t, flags=re.I)
    t = re.sub(r"\s*—\s*Gurumanie Singh$", "", t)
    t = re.sub(r"\s+", " ", t).strip(" -—")
    return t[:120] if t else title


def is_admin_content(text: str) -> bool:
    return bool(ADMIN_RE.search(text[:1500]))


def is_bare_label(title: str, body: str) -> bool:
    if BAD_TITLE_RE.match(title.strip()):
        return True
    if len(body.strip()) < 80 and not extract_commands_from_text(body):
        return True
    if re.match(r"^\d+\.?$", title.strip()):
        return True
    return False


def concept_title_from_section(heading: str, body: str, module_ctx: str = "") -> str:
    h = re.sub(r"^\d+\.\s*", "", heading).strip()
    if module_ctx:
        mod = re.sub(r"^Module\s+\d+:\s*", "", module_ctx)
        if mod.lower() not in h.lower() and len(h) < 40:
            return clean_title(f"{mod} — {h}") if "—" not in h else clean_title(h)
    return clean_title(h)


def reframe_hw_section(body: str, source: str) -> list[dict]:
    """Extract concept nodes from HW-style Q&A blocks."""
    topics = []
    blocks = re.split(r"\n(?=[a-z]\.\s+|\([a-z]\)\s+|\d+\.\s+[A-Z])", body)
    for block in blocks:
        block = block.strip()
        if len(block) < 100 or is_admin_content(block):
            continue
        lines = block.splitlines()
        q = lines[0][:200]
        ans = "\n".join(lines[1:]).strip()
        if len(ans) < 40:
            continue
        # infer concept from keywords
        corpus = (q + " " + ans).lower()
        title = None
        if "arp" in corpus:
            title = "ARP Protocol & Cache Poisoning"
        elif "syn" in corpus and "handshake" in corpus:
            title = "TCP Three-Way Handshake"
        elif "buffer overflow" in corpus or "stack" in corpus:
            title = "Buffer Overflow — Stack Layout"
        elif "sql injection" in corpus or "sqli" in corpus:
            title = "SQL Injection"
        elif "kerberos" in corpus:
            title = "Kerberos Authentication"
        elif "firewall" in corpus:
            title = "Firewall Rules & Packet Filtering"
        elif "dns" in corpus:
            title = "DNS Resolution & Zone Transfers"
        elif "tls" in corpus or "ssl" in corpus or "certificate" in corpus:
            title = "TLS Certificate Validation"
        elif "wifi" in corpus or "802.11" in corpus or "ghz" in corpus:
            title = "Wi-Fi Band Selection & Security"
        elif "hash" in corpus or "encrypt" in corpus:
            title = "Cryptographic Hashing & Encryption"
        elif "nmap" in corpus or "port scan" in corpus:
            title = "Port Scanning Techniques"
        else:
            # use first substantive line
            words = re.findall(r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}", ans)
            title = words[0] if words else clean_title(q[:60])
        title = clean_title(title)
        if BAD_TITLE_RE.match(title):
            continue
        cmds = extract_commands_from_text(ans)
        t = {
            "topicId": slugify(title),
            "title": title,
            "tags": infer_tags(title, ans),
            "summary": first_sentence(ans, 220),
            "detail": ans[:6000],
            "sourceFiles": [source],
            "sourceType": "notes",
        }
        if cmds:
            t["commands"] = [{"cmd": c["cmd"], "explain": c.get("explain") or "From course notes"} for c in cmds]
        topics.append(t)
    return topics


def topics_from_markdown(text: str, source: str, source_key: str) -> tuple[list[dict], int, int]:
    filtered = reframed = 0
    topics = []
    if is_admin_content(text[:800]) and "COMMANDS:" not in text:
        return [], 1, 0

    module_m = re.search(r"^#\s+(.+)$", text, re.M)
    module_ctx = module_m.group(1).strip() if module_m else ""
    is_hw = bool(re.search(r"\bHW\b|homework|assignment", source, re.I))

    if is_hw and len(text) > 200:
        hw_topics = reframe_hw_section(text, source)
        reframed += len(hw_topics)
        topics.extend(hw_topics)

    sections = re.split(r"\n(?=##\s+)", text)
    for sec in sections:
        if not sec.strip().startswith("##"):
            continue
        lines = sec.strip().splitlines()
        heading = re.sub(r"^##\s+", "", lines[0]).strip()
        body = "\n".join(lines[1:]).strip()
        if is_bare_label(heading, body) or is_admin_content(body):
            filtered += 1
            continue
        title = concept_title_from_section(heading, body, module_ctx)
        if BAD_TITLE_RE.match(title) or len(title) < 4:
            filtered += 1
            continue
        cmds = extract_commands_from_text(body)
        t = {
            "topicId": slugify(title),
            "title": title,
            "tags": infer_tags(title, body),
            "summary": first_sentence(body, 220),
            "detail": body[:8000],
            "sourceFiles": [source],
            "sourceType": "notes",
        }
        if cmds:
            t["commands"] = [{"cmd": c["cmd"], "explain": c.get("explain") or "From course notes"} for c in cmds]
        topics.append(t)

        # ### subsections — only when clearly distinct mechanics
        subs = re.split(r"\n(?=###\s+)", body)
        if len(subs) > 1:
            for sub in subs[1:]:
                sl = sub.strip().splitlines()
                if not sl:
                    continue
                sh = re.sub(r"^###\s+", "", sl[0]).strip()
                sb = "\n".join(sl[1:]).strip()
                if len(sb) < 250:
                    continue
                st = concept_title_from_section(sh, sb)
                if BAD_TITLE_RE.match(st) or st.lower() == title.lower():
                    continue
                if not is_independently_searchable_topic(st):
                    continue
                sc = extract_commands_from_text(sb)
                subtopic = {
                    "topicId": slugify(st),
                    "title": st,
                    "tags": infer_tags(st, sb),
                    "summary": first_sentence(sb, 220),
                    "detail": sb[:6000],
                    "sourceFiles": [source],
                    "sourceType": "notes",
                }
                if sc:
                    subtopic["commands"] = [{"cmd": c["cmd"], "explain": c.get("explain") or "From course notes"} for c in sc]
                topics.append(subtopic)

    return topics, filtered, reframed


def topics_from_otw(text: str, source: str, level: str) -> list[dict]:
    goal_m = re.search(r"Level Goal\s*(.+?)(?:Step-by-Step|Solution|$)", text, re.S | re.I)
    goal = goal_m.group(1).strip() if goal_m else ""
    concept_m = re.search(r"Level \d+:\s*([^\n]+)", text)
    concept = concept_m.group(1).strip() if concept_m else f"Level {level}"
    concept = clean_title(concept)
    title_map = {
        "SSH Login": "SSH Client Usage — Port & Credentials",
        "Hidden Files": "Listing Hidden Files with ls -la",
        "Finding a File": "find — Locate Files by Name or Type",
        "Human-Readable Data": "file — Identify File Types",
        "Find a String": "grep — Search File Contents",
        "Find a String in a File": "grep — Search File Contents",
    }
    title = title_map.get(concept, f"Linux CLI — {concept}")
    cmds = extract_commands_from_text(text)
    detail = goal + "\n\n" + text[text.find("Solution"):] if "Solution" in text else text[:3000]
    t = {
        "topicId": slugify(f"bandit-{level}-{concept}"),
        "title": title,
        "tags": ["linux", "cli", "bandit"],
        "summary": first_sentence(goal or f"Bandit level {level} teaches {concept.lower()} using standard Unix utilities.", 220),
        "detail": detail[:6000],
        "sourceFiles": [source],
        "sourceType": "notes",
    }
    if cmds:
        t["commands"] = [{"cmd": c["cmd"], "explain": c.get("explain") or f"Bandit level {level}"} for c in cmds[:10]]
    return [t]


def topics_from_generic(text: str, source: str, source_key: str) -> tuple[list[dict], int, int]:
    filtered = reframed = 0
    if is_admin_content(text[:1000]):
        return [], 1, 0
    is_hw = bool(re.search(r"\bHW\b|homework|assignment|quiz", source, re.I))
    if is_hw:
        hw = reframe_hw_section(text, source)
        if hw:
            return hw, 0, len(hw)
        filtered += 1
        return [], 1, 0

    chunks = re.split(r"\n{2,}", text)
    topics = []
    for chunk in chunks:
        chunk = chunk.strip()
        if len(chunk) < 100 or is_admin_content(chunk):
            filtered += 1
            continue
        line = chunk.splitlines()[0][:80]
        title = clean_title(line)
        if BAD_TITLE_RE.match(title) or len(title) < 5:
            title = clean_title(Path(source).stem.replace("_", " "))
        if BAD_TITLE_RE.match(title):
            filtered += 1
            continue
        cmds = extract_commands_from_text(chunk)
        t = {
            "topicId": slugify(title),
            "title": title,
            "tags": infer_tags(title, chunk),
            "summary": first_sentence(chunk, 220),
            "detail": chunk[:6000],
            "sourceFiles": [source],
            "sourceType": "notes",
        }
        if cmds:
            t["commands"] = [{"cmd": c["cmd"], "explain": c.get("explain") or "From course notes"} for c in cmds]
        topics.append(t)
        if len(topics) >= 6:
            break
    return topics, filtered, reframed


def is_independently_searchable_topic(title: str) -> bool:
    """True when a concept deserves its own lookup node (granularity rule)."""
    tl = title.lower().strip()
    if any(p in tl for p in STANDALONE_NETWORK_TOPICS):
        return True
    for aspect in MERGEABLE_ASPECTS:
        if aspect in tl and len(tl.split()) <= 5:
            return False
    if re.match(r"^(tcp|udp|ip|dns|arp|icmp|ethernet|vlan|osi|dhcp)\s*[—\-:]\s*\S+$", tl):
        return False
    if re.match(r"^(tcp|udp|ip|dns|arp|icmp)\s+(header|flags|window|checksum|options|fields)s?$", tl):
        return False
    return len(tl.split()) >= 4


def get_protocol_family(title: str, tags: list[str] | None = None) -> str | None:
    corpus = f"{title} {' '.join(tags or [])}".lower()
    for family, keywords in PROTOCOL_FAMILIES.items():
        if re.search(rf"\b{re.escape(family)}\b", corpus):
            return family
        if any(kw in corpus for kw in keywords):
            return family
    return None


def merge_topic_group(group: list[dict], family: str) -> dict:
    base = dict(group[0])
    for t in group[1:]:
        base = merge_topics(base, t)
    aspects: list[str] = []
    for t in group:
        tl = t["title"]
        aspect = re.sub(rf"^{re.escape(family)}\s*[—\-:]?\s*", "", tl, flags=re.I).strip()
        if aspect and aspect.lower() != family and aspect.lower() != tl.lower():
            aspects.append(aspect)
        elif tl.lower() != family:
            aspects.append(tl)
    fam_label = family.upper() if len(family) <= 4 else family.title()
    if aspects:
        if len(aspects) == 1:
            base["title"] = clean_title(f"{fam_label} — {aspects[0]}")
        elif len(aspects) <= 3:
            base["title"] = clean_title(f"{fam_label} — {', '.join(aspects)}")
        else:
            base["title"] = clean_title(
                f"{fam_label} — {', '.join(aspects[:2])}, and {len(aspects) - 2} Related Topics"
            )
    detail_parts = [f"### {t['title']}\n\n{t.get('detail', '')}" for t in group]
    base["detail"] = "\n\n".join(detail_parts)[:12000]
    base["summary"] = first_sentence(base["detail"], 220)
    base["topicId"] = slugify(base["title"])
    return base


def cap_network_security_topics(topics: list[dict], max_count: int = NETWORK_SECURITY_CAP) -> list[dict]:
    if len(topics) <= max_count:
        return topics

    mergeable: dict[str, list[dict]] = defaultdict(list)
    standalone: list[dict] = []

    for t in topics:
        fam = get_protocol_family(t["title"], t.get("tags"))
        if fam and not is_independently_searchable_topic(t["title"]):
            mergeable[fam].append(t)
        else:
            standalone.append(t)

    merged: list[dict] = list(standalone)
    for fam, group in mergeable.items():
        if len(group) == 1:
            merged.append(group[0])
        else:
            merged.append(merge_topic_group(group, fam))

    def title_prefix(title: str) -> str:
        m = re.match(r"^([A-Za-z0-9]+)", title.strip())
        return (m.group(1) if m else "misc").lower()

    # Greedy batch merge by shared title prefix (fast; avoids O(n²) similarity scans)
    while len(merged) > max_count:
        groups: dict[str, list[int]] = defaultdict(list)
        for i, t in enumerate(merged):
            groups[title_prefix(t["title"])].append(i)

        mergeable_keys = [k for k, idxs in groups.items() if len(idxs) >= 2]
        if mergeable_keys:
            key = max(mergeable_keys, key=lambda k: len(groups[k]))
            i, j = groups[key][0], groups[key][1]
            a, b = merged[i], merged[j]
            fam = get_protocol_family(a["title"], a.get("tags")) or key
            combined = merge_topic_group([a, b], fam)
            for idx in sorted([i, j], reverse=True):
                del merged[idx]
            merged.append(combined)
            continue

        # Last resort: merge the two shortest-detail topics
        if len(merged) < 2:
            break
        ranked = sorted(range(len(merged)), key=lambda k: len((merged[k].get("detail") or "").split()))
        i, j = ranked[0], ranked[1]
        combined = merge_topic_group([merged[i], merged[j]], "network")
        for idx in sorted([i, j], reverse=True):
            del merged[idx]
        merged.append(combined)

    return merged


def cap_network_security_in_phase1(all_topics: list[dict]) -> list[dict]:
    ns_topics: list[dict] = []
    other_topics: list[dict] = []
    for t in all_topics:
        src = (t.get("sources") or ["unknown"])[0].lower().replace(" ", "").replace("-solutions", "")
        sk = next(
            (k for k, v in SOURCE_CODE.items() if v.lower().replace("-solutions", "") == src.replace("-solutions", "")),
            "",
        )
        primary, _ = assign_domain(t, sk)
        if primary == "network-security":
            ns_topics.append(t)
        else:
            other_topics.append(t)
    before = len(ns_topics)
    ns_topics = cap_network_security_topics(ns_topics, NETWORK_SECURITY_CAP)
    if before != len(ns_topics):
        log(f"Network Security cap: merged {before} → {len(ns_topics)} topics (max {NETWORK_SECURITY_CAP})")
    return other_topics + ns_topics


def merge_topics(a: dict, b: dict) -> dict:
    if len(b.get("summary", "")) > len(a.get("summary", "")):
        a["summary"] = b["summary"]
    if len(b.get("detail", "")) > len(a.get("detail", "")):
        a["detail"] = b["detail"]
    tags = list(dict.fromkeys((a.get("tags") or []) + (b.get("tags") or [])))
    a["tags"] = tags[:6]
    cmds: dict[str, dict] = {}
    for c in (a.get("commands") or []) + (b.get("commands") or []):
        if c and c.get("cmd"):
            k = c["cmd"].strip()
            cmds[k] = cmds.get(k, c) if k not in cmds else (c if len(c.get("explain", "")) > len(cmds[k].get("explain", "")) else cmds[k])
    if cmds:
        a["commands"] = list(cmds.values())
    elif "commands" in a:
        del a["commands"]
    a["sourceFiles"] = list(dict.fromkeys((a.get("sourceFiles") or []) + (b.get("sourceFiles") or [])))
    a["sources"] = list(dict.fromkeys((a.get("sources") or []) + (b.get("sources") or [])))
    return a


def dedupe_topics(topics: list[dict]) -> list[dict]:
    result: list[dict] = []
    used = [False] * len(topics)
    for i, ti in enumerate(topics):
        if used[i]:
            continue
        cur = dict(ti)
        na = clean_title(ti["title"]).lower()
        for j in range(i + 1, len(topics)):
            if used[j]:
                continue
            tj = topics[j]
            nb = clean_title(tj["title"]).lower()
            sim = SequenceMatcher(None, na, nb).ratio()
            overlap = len(set(na.split()) & set(nb.split())) / max(len(set(na.split()) | set(nb.split())), 1)
            if sim >= 0.82 or (overlap >= 0.72 and len(na) > 8):
                cur = merge_topics(cur, tj)
                used[j] = True
        result.append(cur)
    return result


def assign_domain(topic: dict, source_key: str = "") -> tuple[str, str | None]:
    title = topic.get("title", "")
    summary = topic.get("summary", "")
    detail = (topic.get("detail") or "")[:600]
    tags = " ".join(topic.get("tags", []))
    corpus = f"{title} {summary} {tags} {detail}".lower()

    if source_key in CLASS_BIAS:
        primary = CLASS_BIAS[source_key]
    else:
        scores = {d[0]: 0.0 for d in DOMAINS}
        for did, kws in DOMAIN_KEYWORDS.items():
            for kw in kws:
                if kw in corpus:
                    scores[did] += 2.0 if " " in kw else 1.0
        primary = max(scores, key=scores.get)
        if scores[primary] <= 0:
            primary = "network-security"
            topic.setdefault("tags", [])
            if "unreviewed" not in topic["tags"]:
                topic["tags"].append("unreviewed")

    # secondary domain tag
    scores2 = sorted(
        ((did, sum(2 if kw in corpus else 0 for kw in DOMAIN_KEYWORDS[did])) for did, _ in DOMAINS),
        key=lambda x: -x[1],
    )
    secondary = None
    for did, sc in scores2:
        if did != primary and sc >= 2:
            secondary = did.replace("-", "_")
            break
    return primary, secondary


def phase1_extract_synthesize() -> list[dict]:
    all_topics: list[dict] = []
    setup_tesseract()
    log("=== PHASE 1: Extract & Synthesize ===")
    log(f"Tesseract: {TESSERACT_OK}")

    for folder in FOLDER_ORDER:
        stats = {"synthesized": 0, "filtered": 0, "reframed": 0, "skipped_files": 0}
        folder_path = ROOT / folder
        source_key = CLASS_META[folder]["classId"]
        source_label = SOURCE_CODE.get(source_key, folder)

        if not folder_path.is_dir():
            log(f"{folder}: ERROR — not found")
            continue

        extracts: dict[str, str] = {}
        for path in sorted(folder_path.rglob("*")):
            if not path.is_file():
                continue
            rel = str(path.relative_to(folder_path))
            text, parser, reason = extract_file_rebuild(path, folder)
            if parser == "skip":
                stats["skipped_files"] += 1
                continue
            if text and len(text.strip()) >= 20:
                extracts[rel] = text

        folder_topics: list[dict] = []

        if folder == "nmap-notes":
            for c in NMAP_CURATED:
                t = {**c, "topicId": slugify(c["title"]), "sourceFiles": ["nmap_notes.pdf"], "sourceType": "notes"}
                folder_topics.append(t)

        for rel, text in extracts.items():
            low = rel.lower()
            try:
                if low.endswith(".md"):
                    ts, f, r = topics_from_markdown(text, rel, source_key)
                elif "overthewire" in folder and low.endswith(".html") and "level" in low:
                    lvl = re.search(r"level(\d+)", low)
                    ts = topics_from_otw(text, rel, lvl.group(1) if lvl else "0")
                    f, r = 0, 0
                elif low == "hexpacket.txt":
                    ts = [{
                        "topicId": "wireshark-hex-header-fields",
                        "title": "Wireshark Hex Dump — Ethernet/IP/TCP Header Fields",
                        "tags": ["wireshark", "tcp", "network"],
                        "summary": "Annotated hex capture mapping Ethernet, IP, and TCP header fields field-by-field.",
                        "detail": text,
                        "sourceFiles": [rel],
                        "sourceType": "notes",
                    }]
                    f, r = 0, 0
                else:
                    ts, f, r = topics_from_generic(text, rel, source_key)
                stats["filtered"] += f
                stats["reframed"] += r
                for t in ts:
                    t["sources"] = [source_label]
                    folder_topics.append(t)
            except Exception as e:
                log(f"  SYNTH ERROR {rel}: {e}")

        folder_topics = dedupe_topics(folder_topics)
        stats["synthesized"] = len(folder_topics)
        all_topics.extend(folder_topics)
        folder_stats[folder] = stats
        log(
            f"{folder}: {stats['synthesized']} topics synthesized, "
            f"{stats['filtered']} sections filtered, "
            f"{stats['reframed']} HW questions reframed, "
            f"{stats['skipped_files']} files skipped."
        )

    all_topics = dedupe_topics(all_topics)
    all_topics = cap_network_security_in_phase1(all_topics)
    log(f"Phase 1 total after global dedup + NS cap: {len(all_topics)} topics")
    return all_topics


def build_augment_prompt(domain_name: str, domain_topics: list[dict]) -> str:
    slim = [
        {
            "topicId": t["topicId"],
            "title": t["title"],
            "tags": t.get("tags", []),
            "summary": t.get("summary", ""),
            "wordCount": len((t.get("detail") or "").split()),
        }
        for t in domain_topics
    ]
    thin_ids = [t["topicId"] for t in domain_topics if len((t.get("detail") or "").split()) < 100]
    return f'''Domain: {domain_name}

Topics already extracted from course notes ({len(domain_topics)} total):
{json.dumps(slim, indent=2)}

Thin topic IDs (detail under 100 words — prioritize for JOB 1): {json.dumps(thin_ids)}

You have two jobs:

JOB 1 — ENRICH thin existing topics (topicIds in thin list above, plus any others you judge vague).
For each enriched topic return the full updated object keyed by matching topicId.

JOB 2 — ADD 8-15 missing topics for {domain_name} not covered above.

Return JSON only:
{{"enriched": [...], "added": [...]}}

Schema per topic:
{{"topicId": "...", "title": "...", "type": "concept|tool|technique|...", "tags": [...], "summary": "...", "core_idea": "markdown body (detail accepted as alias)", "commands": [{{"cmd":"...","explain":"..."}}], "related": [], "metadata": {{"difficulty": "intermediate", "confidence": "decent", "relevance": "both", "cert_mapping": [], "last_updated": "YYYY-MM-DD"}}}}

Quality: cheat-sheet density, specific titles, accurate command syntax. No homework/admin content.
'''


def build_floor_prompt(domain_name: str, topics: list[dict], floor: int) -> str:
    existing = [{"topicId": t["topicId"], "title": t["title"]} for t in topics]
    need = max(floor - len(topics), 1)
    return f'''Domain: {domain_name}

Current topic count: {len(topics)}. Minimum required: {floor}.
Add exactly {need} NEW topics not already covered.

Already covered (do not duplicate or lightly rephrase):
{json.dumps(existing, indent=2)}

Return JSON only: {{"added": [...]}}

Each added topic must follow this schema:
{{"topicId": "kebab-case", "title": "Specific Concept Name", "type": "concept", "tags": [...], "summary": "1-2 sentences, 15+ words", "core_idea": "Full markdown, 100+ words", "commands": [{{"cmd":"...","explain":"..."}}], "related": [], "metadata": {{"difficulty": "intermediate", "confidence": "decent", "relevance": "both", "cert_mapping": [], "last_updated": "YYYY-MM-DD"}}}}

Cover professional concepts a Security Engineer or SOC analyst must know in {domain_name}.
Omit commands for concept-only topics. No homework/admin content.
'''


def apply_api_augment_data(topics: list[dict], data: dict) -> tuple[list[dict], int, int]:
    enriched = {e["topicId"]: e for e in data.get("enriched", []) if e.get("topicId")}
    n_enriched = n_added = 0
    for t in topics:
        if t["topicId"] in enriched:
            e = enriched[t["topicId"]]
            t["title"] = clean_title(e.get("title", t["title"]))
            t["summary"] = e.get("summary", t["summary"])
            if e.get("core_idea"):
                t["core_idea"] = e["core_idea"]
            if e.get("detail"):
                t["detail"] = e["detail"]
            elif e.get("core_idea"):
                t["detail"] = e["core_idea"]
            else:
                t["detail"] = e.get("detail", t.get("detail", ""))
            if t.get("detail") and not t.get("core_idea"):
                t["core_idea"] = t["detail"]
            if e.get("tags"):
                t["tags"] = e["tags"]
            if e.get("commands"):
                t["commands"] = e["commands"]
            t["sourceType"] = "enriched"
            n_enriched += 1
        else:
            t.setdefault("sourceType", "notes")
    existing_ids = {t["topicId"] for t in topics}
    for nt in data.get("added", []):
        nt["topicId"] = slugify(nt.get("topicId") or nt.get("title", "topic"))
        if nt["topicId"] in existing_ids:
            continue
        nt["title"] = clean_title(nt.get("title", "Untitled"))
        nt.setdefault("tags", [])
        nt["sourceType"] = "added"
        nt.setdefault("sources", [])
        nt.setdefault("sourceFiles", [])
        topics.append(nt)
        existing_ids.add(nt["topicId"])
        n_added += 1
    return topics, n_enriched, n_added


def append_seed_topics(topics: list[dict], domain_id: str, seeds: dict) -> int:
    existing_ids = {t["topicId"] for t in topics}
    added = 0
    for seed in seeds.get(domain_id, []):
        sid = seed.get("topicId") or slugify(seed["title"])
        if sid in existing_ids:
            continue
        nt = dict(seed)
        nt["topicId"] = sid
        nt["sourceType"] = seed.get("sourceType", "added")
        nt.setdefault("sources", [])
        nt.setdefault("sourceFiles", [])
        topics.append(nt)
        existing_ids.add(sid)
        added += 1
    return added


def ensure_domain_floor_api(client, domain_id: str, domain_name: str, topics: list[dict]) -> list[dict]:
    floor = DOMAIN_TOPIC_FLOOR.get(domain_id, 0)
    if not floor or len(topics) >= floor:
        return topics
    max_followups = 4
    for attempt in range(1, max_followups + 1):
        if len(topics) >= floor:
            break
        prompt = build_floor_prompt(domain_name, topics, floor)
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=12000,
                system="You are building a cybersecurity professional knowledge base. Output only valid JSON. No markdown fences, no preamble, no explanation.",
                messages=[{"role": "user", "content": prompt}],
            )
            data = parse_claude_json(resp.content[0].text)
            before = len(topics)
            topics, _, n_added = apply_api_augment_data(topics, {"enriched": [], "added": data.get("added", [])})
            log(f"{domain_name}: floor follow-up {attempt} — added {n_added} topics ({before} → {len(topics)}, floor {floor})")
            if n_added == 0:
                break
        except Exception as e:
            log(f"{domain_name}: floor follow-up {attempt} FAILED — {e}")
            break
    if len(topics) < floor:
        seeds = json.loads(SEEDS_PATH.read_text(encoding="utf-8")) if SEEDS_PATH.exists() else {}
        n = append_seed_topics(topics, domain_id, seeds)
        if n:
            log(f"{domain_name}: floor offline seed fallback — added {n} topics ({len(topics)} total, floor {floor})")
    return topics


def ensure_domain_floor_offline(domain_id: str, domain_name: str, topics: list[dict], seeds: dict) -> list[dict]:
    floor = DOMAIN_TOPIC_FLOOR.get(domain_id, 0)
    if not floor:
        return topics
    added = append_seed_topics(topics, domain_id, seeds)
    if added:
        log(f"{domain_name}: floor seeds — added {added} topics (total {len(topics)}, floor {floor})")
    if len(topics) < floor:
        log(f"{domain_name}: WARNING — {len(topics)}/{floor} topics after offline floor (expand domain_seeds.json)")
    return topics


def parse_claude_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


def load_anthropic_key() -> str | None:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key
    env_path = ROOT / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("ANTHROPIC_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


SEEDS_PATH = ROOT / "scripts" / "domain_seeds.json"


def auto_enrich_topic(topic: dict) -> bool:
    detail = topic.get("detail") or ""
    summary = topic.get("summary") or ""
    dw, sw = len(detail.split()), len(summary.split())
    changed = False
    if sw < 15 and dw >= 40:
        topic["summary"] = first_sentence(detail, 220)
        changed = True
    if dw < 80 and sw >= 12:
        topic["detail"] = f"{summary}\n\n{detail}".strip()[:8000]
        changed = True
    if changed and topic.get("sourceType") == "notes":
        topic["sourceType"] = "enriched"
    return changed


def augment_offline(domain_buckets: dict[str, list[dict]]) -> dict[str, int]:
    """Fallback augmentation: seed topics + auto-enrich thin notes."""
    stats = {"enriched": 0, "added": 0}
    seeds = {}
    if SEEDS_PATH.exists():
        seeds = json.loads(SEEDS_PATH.read_text(encoding="utf-8"))

    for domain_id, domain_name in DOMAINS:
        topics = domain_buckets.get(domain_id, [])
        added_this = append_seed_topics(topics, domain_id, seeds)
        stats["added"] += added_this
        n_enriched = 0
        for t in topics:
            if auto_enrich_topic(t):
                n_enriched += 1
        stats["enriched"] += n_enriched
        topics = ensure_domain_floor_offline(domain_id, domain_name, topics, seeds)
        domain_buckets[domain_id] = topics
        log(f"{domain_name}: {n_enriched} enriched, {added_this} added offline (total: {len(topics)} topics)")
    return stats


def phase2_augment(domain_buckets: dict[str, list[dict]]) -> dict[str, list[dict]]:
    log("\n=== PHASE 2: Claude API Augmentation ===")
    api_key = load_anthropic_key()
    global augment_mode
    if not api_key:
        log("ANTHROPIC_API_KEY not set — using offline augmentation (domain seeds + auto-enrich)")
        augment_mode = "offline"
        augment_offline(domain_buckets)
        return domain_buckets

    augment_mode = "api"

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
    except Exception as e:
        log(f"anthropic import failed: {e}")
        api_failures.extend([d[1] for d in DOMAINS])
        return domain_buckets

    for domain_id, domain_name in DOMAINS:
        topics = domain_buckets.get(domain_id, [])
        if not topics:
            log(f"{domain_name}: 0 topics — skip API")
            continue
        if augment_mode == "mixed":
            seeds = json.loads(SEEDS_PATH.read_text(encoding="utf-8")) if SEEDS_PATH.exists() else {}
            append_seed_topics(topics, domain_id, seeds)
            for t in topics:
                auto_enrich_topic(t)
            topics = ensure_domain_floor_offline(domain_id, domain_name, topics, seeds)
            domain_buckets[domain_id] = topics
            continue
        prompt = build_augment_prompt(domain_name, topics)
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=16000,
                system="You are building a cybersecurity professional knowledge base. Output only valid JSON. No markdown fences, no preamble, no explanation.",
                messages=[{"role": "user", "content": prompt}],
            )
            raw = resp.content[0].text
            data = parse_claude_json(raw)
            topics, n_enriched, n_added = apply_api_augment_data(topics, data)
            topics = ensure_domain_floor_api(client, domain_id, domain_name, topics)
            domain_buckets[domain_id] = topics
            log(f"{domain_name}: {n_enriched} enriched, {n_added} added (total: {len(topics)} topics)")
        except Exception as e:
            err = str(e).lower()
            log(f"{domain_name}: API FAILED — {e} — falling back to offline for this domain")
            api_failures.append(domain_name)
            augment_mode = "mixed"
            if "credit balance" in err or "authentication" in err or "invalid api key" in err:
                log("API unavailable for billing/auth — offline augmentation for all remaining domains")
            seeds = json.loads(SEEDS_PATH.read_text(encoding="utf-8")) if SEEDS_PATH.exists() else {}
            append_seed_topics(topics, domain_id, seeds)
            for t in topics:
                auto_enrich_topic(t)
            topics = ensure_domain_floor_offline(domain_id, domain_name, topics, seeds)
            domain_buckets[domain_id] = topics

    return domain_buckets


def phase3_cluster(topics: list[dict]) -> dict[str, list[dict]]:
    log("\n=== PHASE 3: Cluster into domains ===")
    buckets: dict[str, list[dict]] = {d[0]: [] for d in DOMAINS}
    for t in topics:
        src = (t.get("sources") or ["unknown"])[0].lower().replace(" ", "").replace("-solutions", "")
        sk = next((k for k, v in SOURCE_CODE.items() if v.lower().replace("-solutions", "") == src.replace("-solutions", "")), "")
        primary, secondary = assign_domain(t, sk)
        if secondary and secondary not in (t.get("tags") or []):
            t.setdefault("tags", []).append(secondary)
        buckets[primary].append(t)
    for did, dname in DOMAINS:
        log(f"  {dname}: {len(buckets[did])} topics")
    return buckets


def validate_topics(topics: list[dict]) -> list[dict]:
    valid = []
    for t in topics:
        title = t.get("title", "")
        summary = t.get("summary", "")
        if not summary:
            continue
        if ADMIN_SUMMARY_RE.search(summary):
            continue
        if LEAK_TITLE_RE.search(title) and BAD_TITLE_RE.search(title):
            t["title"] = clean_title(title)
            if LEAK_TITLE_RE.search(t["title"]) and BAD_TITLE_RE.match(t["title"]):
                continue
        if len(summary.split()) < 15:
            # thin — expand from detail if possible
            detail = t.get("detail", "")
            if len(detail) > 80:
                t["summary"] = first_sentence(detail, 220)
            elif t.get("sourceType") != "added":
                continue
        t["topicId"] = slugify(t.get("topicId") or t["title"])
        t["title"] = clean_title(t["title"])
        valid.append(finalize_topic_record(t))
    return valid


def write_output(domain_buckets: dict[str, list[dict]]) -> None:
    log("\n=== PHASE 5: Write & Validate ===")
    prepared: dict[str, list[dict]] = {}
    for domain_id, domain_name in DOMAINS:
        topics = validate_topics(domain_buckets.get(domain_id, []))
        seen: set[str] = set()
        final = []
        for t in topics:
            tid = t["topicId"]
            n = 2
            while tid in seen:
                tid = f"{t['topicId']}-{n}"
                n += 1
            t["topicId"] = tid
            seen.add(tid)
            st = t.get("sourceType", "notes")
            source_type_counts[st] += 1
            final.append(t)
        prepared[domain_id] = final
        log(f"  {domain_name}: {len(final)} topics validated")

    out = build_knowledge_document(prepared, category="Cybersecurity")
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    log(f"Wrote nested root tree to {OUT_PATH}")
    log(f"  Top-level domains: {len(out['root']['children'])}")
    log(f"  Tree depth: {max(tree_depth_for_log(out['root']), 0)}")


def tree_depth_for_log(node: dict) -> int:
    children = node.get("children") or []
    if not children:
        return 0
    return 1 + max(tree_depth_for_log(c) for c in children)


def print_summary(domain_buckets: dict[str, list[dict]]) -> None:
    total = sum(len(validate_topics(v)) for v in domain_buckets.values())
    log("\n========== FINAL SUMMARY ==========")
    log(f"Total topics: {total}")
    log(f"Source types: notes={source_type_counts['notes']}, enriched={source_type_counts['enriched']}, added={source_type_counts['added']}")
    for domain_id, domain_name in DOMAINS:
        topics = domain_buckets.get(domain_id, [])
        notes = sum(1 for t in topics if t.get("sourceType") == "notes")
        enriched = sum(1 for t in topics if t.get("sourceType") == "enriched")
        added = sum(1 for t in topics if t.get("sourceType") == "added")
        log(f"  {domain_name}: {len(topics)} (notes={notes}, enriched={enriched}, added={added})")
    log("Folder filter stats:")
    for folder, st in folder_stats.items():
        log(f"  {folder}: {st}")
    if augment_mode == "offline":
        log("Augmentation: offline fallback (ANTHROPIC_API_KEY not set — seeds + auto-enrich)")
    elif api_failures:
        log(f"API failures (per-domain offline fallback): {', '.join(api_failures)}")
    elif augment_mode == "api":
        log("All domain API calls succeeded.")


def main():
    topics = phase1_extract_synthesize()
    # provisional cluster for API grouping
    buckets = phase3_cluster(topics)
    buckets = phase2_augment(buckets)
    # re-cluster added topics (already in domain buckets from API)
    write_output(buckets)
    print_summary(buckets)
    LOG_PATH.write_text("\n".join(logs) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
