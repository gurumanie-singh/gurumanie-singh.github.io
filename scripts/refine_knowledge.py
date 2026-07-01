#!/usr/bin/env python3
"""Post-process cybersecurity.json: fix class names, curated reference topics, strip null commands."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "cybersecurity.json"

NMAP_TOPICS = [
    {
        "topicId": "nmap-host-discovery",
        "title": "Nmap — Host Discovery & Skip-Ping",
        "tags": ["recon", "nmap", "network"],
        "summary": "-Pn skips host discovery when you know the target is up. Default discovery mixes ICMP echo, TCP SYN to 443, ACK to 80, and ICMP timestamp.",
        "detail": "Host discovery runs before port scanning unless disabled. Use **-Pn** when ICMP is blocked but services still respond — common on firewalled hosts.\n\n**Discovery probes (default):**\n- ICMP echo request\n- TCP SYN to port 443\n- TCP ACK to port 80\n- ICMP timestamp request\n\nRoot is required for raw SYN scans (-sS) but not for connect scans (-sT).",
        "commands": [
            {"cmd": "nmap -Pn 192.168.1.1", "explain": "Skip host discovery; scan even if host appears down"},
            {"cmd": "nmap -sn 192.168.1.0/24", "explain": "Ping sweep only — no port scan"},
        ],
        "sourceFiles": ["nmap_notes.pdf"],
    },
    {
        "topicId": "nmap-target-specification",
        "title": "Nmap — Target Specification",
        "tags": ["recon", "nmap"],
        "summary": "Targets accept single IPs, CIDR subnets, ranges, lists from file (-iL), or hostnames. Default scans top 1000 TCP ports if -p not specified.",
        "detail": "Nmap accepts flexible target syntax. Omitting -p scans the **1000 most common ports**.\n\n| Form | Example |\n|------|---------|\n| Single IP | `nmap 1.2.3.4` |\n| CIDR subnet | `nmap 1.2.3.4/24` |\n| IP range | `nmap 1.2.3.4-8` |\n| List file | `nmap -iL hosts.txt` |\n| Hostname | `nmap scanme.nmap.org` |",
        "commands": [
            {"cmd": "nmap 1.2.3.4", "explain": "Single host, default 1000 ports"},
            {"cmd": "nmap 1.2.3.4/24", "explain": "Entire /24 subnet"},
            {"cmd": "nmap 1.2.3.4-8", "explain": "IP range within last octet"},
            {"cmd": "nmap -iL host.txt", "explain": "Targets from file, one host per line"},
        ],
        "sourceFiles": ["nmap_notes.pdf"],
    },
    {
        "topicId": "nmap-port-selection",
        "title": "Nmap — Port Selection",
        "tags": ["recon", "nmap", "network"],
        "summary": "-p accepts single ports, ranges, comma lists, UDP (U:), and -p- for all 65535 ports. --top-ports N limits to the N most common ports.",
        "detail": "Port syntax is flexible. Combine TCP and UDP in one scan with `T:` and `U:` prefixes.\n\n**Scan status from SYN scan:**\n- **open** — SYN-ACK received\n- **closed** — RST received\n- **filtered** — no response (firewall dropping)\n- **unfiltered** — ACK scan response but no SYN test",
        "commands": [
            {"cmd": "nmap 1.2.3.4 -p 80", "explain": "Single port"},
            {"cmd": "nmap 1.2.3.4 -p 10-30", "explain": "Port range"},
            {"cmd": "nmap 1.2.3.4 -p 80,22,111", "explain": "Specific port list"},
            {"cmd": "nmap 1.2.3.4 -p 1:22,U:53", "explain": "TCP ports 1-22 plus UDP 53"},
            {"cmd": "nmap 1.2.3.4 -p-", "explain": "All 65535 ports"},
            {"cmd": "nmap 1.2.3.4 --top-ports 100", "explain": "Top 100 most common ports"},
        ],
        "sourceFiles": ["nmap_notes.pdf"],
    },
    {
        "topicId": "nmap-scan-techniques",
        "title": "Nmap — Scan Techniques (-sS, -sT, -sU, -sA)",
        "tags": ["recon", "nmap", "network", "firewall"],
        "summary": "-sS sends SYN without completing handshake (stealth, needs root). -sT does full connect (no root). -sU is UDP. -sA maps firewall rules via ACK responses.",
        "detail": "**TCP scan types:**\n- **-sT** — Full TCP connect; logged, no root needed\n- **-sS** — Half-open SYN scan; faster, quieter, requires root\n- **-sF / -sX / -sN** — FIN, Xmas, Null scans; exploit RFC behavior on closed ports\n- **-sP** — Ping scan (host discovery only)\n- **-sU** — UDP scan; slow, often ICMP unreachable on closed\n- **-sA** — ACK scan; maps firewall filter rules, not port open/closed\n\n**Firewall example (Linux iptables drop on port 22):**\n`sudo iptables -L INPUT -p tcp --dport=22 -j DROP`",
        "commands": [
            {"cmd": "nmap -sS 1.2.3.4", "explain": "Stealth SYN scan (root required)"},
            {"cmd": "nmap -sT 1.2.3.4", "explain": "Full TCP connect scan"},
            {"cmd": "nmap -sU 1.2.3.4", "explain": "UDP port scan"},
            {"cmd": "nmap -sA 1.2.3.4", "explain": "ACK scan for firewall rule mapping"},
        ],
        "sourceFiles": ["nmap_notes.pdf"],
    },
    {
        "topicId": "nmap-timing-templates",
        "title": "Nmap — Timing Templates (-T0 to -T5)",
        "tags": ["recon", "nmap"],
        "summary": "-T0 (Paranoid) to -T5 (Insane) control probe rate and timeouts. -T4 is default aggressive; lower T when IDS evasion matters.",
        "detail": "Timing templates trade speed against stealth and accuracy.\n\n| Flag | Name | Use when |\n|------|------|----------|\n| -T0 | Paranoid | IDS evasion, very slow |\n| -T1 | Sneaky | Slow, evasive |\n| -T2 | Polite | Low bandwidth impact |\n| -T3 | Normal | Default |\n| -T4 | Aggressive | Fast LAN scans |\n| -T5 | Insane | Maximum speed, may miss ports |",
        "commands": [
            {"cmd": "nmap -T4 1.2.3.4", "explain": "Aggressive timing — common for lab/LAN scans"},
            {"cmd": "nmap -T2 1.2.3.4", "explain": "Polite — slower, less likely to trigger rate limits"},
        ],
        "sourceFiles": ["nmap_notes.pdf"],
    },
    {
        "topicId": "nmap-service-os-scripts",
        "title": "Nmap — Service Detection, OS Fingerprinting & NSE",
        "tags": ["recon", "nmap", "enumeration"],
        "summary": "-sV probes open ports for version banners. -O guesses OS from stack quirks. -A enables OS detection, version detection, script scan, and traceroute. NSE scripts live in /usr/share/nmap/scripts.",
        "detail": "**Version & OS detection:**\n- `-sV` — Probe open ports to determine service/version\n- `-O` — TCP/IP stack fingerprinting for OS guess\n- `-A` — Aggressive: -sV + -O + default scripts + traceroute\n\n**Nmap Scripting Engine (NSE):**\nScripts stored in `/usr/share/nmap/scripts`. Run with `--script <name>` or categories like `vuln`, `safe`.\n\n**Verbosity:** `-v` / `-vv` for more runtime detail.",
        "commands": [
            {"cmd": "nmap -sV 1.2.3.4", "explain": "Service and version detection"},
            {"cmd": "nmap -O 1.2.3.4", "explain": "OS fingerprinting"},
            {"cmd": "nmap -A 1.2.3.4", "explain": "Aggressive scan bundle"},
            {"cmd": "nmap scanme.nmap.org --script http-headers", "explain": "Run specific NSE script against target"},
        ],
        "sourceFiles": ["nmap_notes.pdf"],
    },
    {
        "topicId": "nmap-output-formats",
        "title": "Nmap — Output Formats",
        "tags": ["recon", "nmap"],
        "summary": "-oN normal, -oX XML, -oG grepable (legacy). Save with -oA for all formats at once.",
        "detail": "Persist scan results for reporting or piping to other tools.\n\n- **-oN** — Normal human-readable\n- **-oX** — XML (parseable)\n- **-oG** — Grepable (legacy, rarely used now)\n- **-oA basename** — All major formats with shared basename",
        "commands": [
            {"cmd": "nmap 1.2.3.4 -oN scan.txt", "explain": "Save normal output"},
            {"cmd": "nmap 1.2.3.4 -oA scan_results", "explain": "Save all output formats as scan_results.*"},
        ],
        "sourceFiles": ["nmap_notes.pdf"],
    },
]


def strip_null_commands(obj):
    if isinstance(obj, dict):
        if "commands" in obj and (obj["commands"] is None or obj["commands"] == []):
            del obj["commands"]
        elif isinstance(obj.get("commands"), list):
            obj["commands"] = [c for c in obj["commands"] if c and c.get("cmd")]
            if not obj["commands"]:
                del obj["commands"]
        for v in list(obj.values()):
            strip_null_commands(v)
    elif isinstance(obj, list):
        for item in obj:
            strip_null_commands(item)


def fix_class_names(data):
    for cls in data["classes"]:
        if cls["classId"] == "nmap-notes":
            cls["className"] = "Nmap Scanning Reference"
            cls["topics"] = NMAP_TOPICS
        elif cls["classId"] == "overthewire":
            cls["className"] = "OverTheWire Bandit Solutions"
            cls["topics"] = [
                t for t in cls["topics"]
                if t["title"].startswith("Bandit Level")
            ]
            for t in cls["topics"]:
                t["title"] = re.sub(r"\s*—\s*Gurumanie Singh$", "", t["title"])
                t["tags"] = list(dict.fromkeys(t["tags"]))  # dedupe tags


def main():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    fix_class_names(data)
    strip_null_commands(data)
    JSON_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    total = sum(len(c["topics"]) for c in data["classes"])
    print(f"Refined {JSON_PATH}: {total} topics")


if __name__ == "__main__":
    main()
