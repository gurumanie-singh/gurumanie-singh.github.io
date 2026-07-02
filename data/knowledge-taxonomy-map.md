# Knowledge taxonomy mapping (Stage 2)

Legacy cluster domains from the extract pipeline are grouped under the new top-level taxonomy.
Each legacy bucket becomes a **topic** branch (depth 2) under its mapped taxonomy **domain** (depth 1).
Individual notes remain **concept** leaves (depth 3).

| Legacy cluster ID | Legacy name | New taxonomy ID | New taxonomy name |
|---|---|---|---|
| `network-security` | Network Security | `networks` | Networks |
| `web-security` | Web Security | `web-security` | Web Security |
| `exploitation-vulnerability` | Exploitation & Vulnerability Research | `offensive-security` | Offensive Security |
| `reconnaissance-osint` | Reconnaissance & OSINT | `offensive-security` | Offensive Security |
| `cryptography` | Cryptography | `cryptography` | Cryptography |
| `linux-cli` | Linux & CLI | `systems` | Systems |
| `malware-threat` | Malware & Threat Analysis | `malware-re` | Malware & RE |
| `digital-forensics` | Digital Forensics | `detection-monitoring` | Detection & Monitoring |
| `cloud-infrastructure` | Cloud & Infrastructure Security | `cloud-security` | Cloud Security |
| `software-code-security` | Software & Code Security | `systems` | Systems |
| `intrusion-detection-monitoring` | Intrusion Detection & Monitoring | `detection-monitoring` | Detection & Monitoring |
| `incident-response` | Incident Response | `detection-monitoring` | Detection & Monitoring |

## New taxonomy domains (no legacy bucket yet)

- `fundamentals` — Fundamentals
- `identity` — Identity
- `labs-ctfs` — Labs & CTFs
- `tools` — Tools
- `case-studies` — Case Studies
- `career-interview-prep` — Career & Interview Prep

## Tree depth model

```
0  root (Cybersecurity)
1  taxonomy domain (e.g. Networks)
2  legacy group / topic branch (e.g. Network Security)
3  concept leaf (individual note)
```

Max intentional depth: **5** (root → domain → topic → subtopic → leaf). Current migration uses depth **4**.
