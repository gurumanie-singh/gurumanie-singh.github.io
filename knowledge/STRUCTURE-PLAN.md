# Cybersecurity Knowledge Base — Structural Expansion Plan

**Document purpose:** Planning artifact for deepening `data/cybersecurity.json` hierarchy only. No leaf content authoring. No code or JSON changes in this pass.

**Revision note (sanity pass, July 2026):** This version corrects arithmetic errors in the Networks, Web Security, and Cryptography node counts (found by manually recounting the listed hierarchy against each domain's stated subtotal — see corrected Summary table), completes the Appendix leaf inventory (originally cut off after 2 of 12 domains), removes a stray leftover fragment at the end of the file, and updates three framework citations that were either outdated (NIST CSF 1.1 codes superseded by CSF 2.0; OWASP Top 10 2021 numbering superseded by the 2025 edition) or unverifiable as written (one CEH/Security+ citation reworded — see `network-services-applications` reasoning). All leaf-to-node mappings, relocations, and the 180/9/0 leaf accounting were checked and are unchanged — those were correct in the original draft.

**Inventory baseline (current state):** 12 domains, 180 leaf nodes (`type: concept` or `type: tool`), max depth 3 (`domain → topic → leaf`). Domains with existing multi-topic depth: Systems (2 topics), Detection & Monitoring (3 topics), Offensive Security (3 topics). All other domains use a single near-duplicate-named topic bucket.

**Node type convention for implementation:** Intermediate structural nodes remain `type: "topic"`. Existing leaves retain their current `type` and content fields; only `parent` position changes.

**ID convention:** All proposed structural node IDs use kebab-case, matching existing patterns (e.g. `network-fundamentals`, `tcp-transport-behavior`).

---

## Context & Goal

This knowledge base is a **personal cybersecurity reference / cheat sheet**, rendered as an **interactive mindmap** on a public portfolio site (`knowledge/index.html` + `js/knowledge-mindmap.js`). Each leaf node opens a modal with structured notes (`summary`, `core_idea`, `bullets`, `related`, etc.).

**Current problem:** Structure is shallow. Most domains collapse to **Domain → one Subdomain-equivalent topic → Leaf** (3 levels). Only **Detection & Monitoring**, **Systems**, and **Offensive Security** already have reasonable topic-level grouping.

**Goal of this pass:** Deepen and broaden **structure only** — domains → subdomains → topics → subtopics (where legitimately warranted). Do **not** write or rewrite leaf note content. Content authoring is a later pass.

**Depth principle:** Depth must **not** be forced uniform. Some branches naturally end at 4 levels; others justify 5–6. Do not pad branches to hit a depth target. Empty placeholder leaves are out of scope — structural nodes may exist with zero children until a later content pass.

**Grounding rule:** Every proposed subdomain, topic, and subtopic must reflect **recognized industry classification** (NIST CSF, MITRE ATT&CK, OWASP, CompTIA objective domains, CISSP domains, SANS/GIAC curricula, CEH exam domains, etc.). Names are structural categories only — no fabricated attack names, tools, or technical claims.

**Existing content rule:** All **180** current leaves must be **relocated** into the new hierarchy. No leaf left at the old shallow level while parallel empty structure is added. Leaf **content is immutable**; only hierarchy position may change.

**Removed domains (not in scope):** Career & Interview Prep, Case Studies, Labs & CTFs — already deleted from JSON.

---

## 1. Fundamentals

**Current state:** `fundamentals → fundamentals-core-concepts` (1 topic, 6 native leaves; **11 leaves** after cross-domain relocations in).

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `security-principles-models` | Security Principles & Architectural Models | Reflects CISSP Domain 1 / Security+ "General Security Concepts" — foundational assurance models (CIA, layered defense, zero trust). |
| `risk-threat-landscape` | Risk, Threats & Adversaries | Reflects NIST CSF **Identify** function and ISO 27005 risk vocabulary — threat, vulnerability, impact, adversary context. |
| `security-controls-governance` | Security Controls & Governance Basics | Reflects NIST SP 800-53 control families and Security+ control-type taxonomy — preventive/detective/corrective/compensating and least privilege as a control principle. |

### Hierarchy & leaf mapping

#### `security-principles-models`

**Topic: `assurance-foundations`** — core information-security properties  
- **Existing leaves:** `cia-triad`, `information-assurance-pillars` *(relocated from Offensive)*

**Topic: `defense-architecture`** — layered and perimeterless models  
- **Existing leaves:** `defense-in-depth`, `zero-trust-model`

#### `risk-threat-landscape`

**Topic: `risk-quantification`** — risk assessment vocabulary  
- **Existing leaves:** `risk-threat-vulnerability-impact`, `security-core-vocabulary` *(relocated from Offensive)*

**Topic: `threat-actors-and-motivation`** — adversary taxonomy and attack surface framing  
- **Existing leaves:** `threat-actor-sophistication` *(relocated from Offensive)*, `attack-surface-access-vectors` *(relocated from Offensive)*, `adversary-target-system-categories` *(relocated from Cryptography)*

#### `security-controls-governance`

**Topic: `control-types-and-access-principles`** — control classification and privilege minimization  
- **Existing leaves:** `security-control-types`, `least-privilege-principle`

### Flags for review

- Native Fundamentals leaves (6) all map cleanly. Five additional leaves relocate in from Offensive/Cryptography (see Cross-Domain Relocation Summary).

### Proposed new structural nodes (this domain)

- Subdomains: **3**
- Topics: **5** (includes new `threat-actors-and-motivation` for relocated leaves)
- Subtopics: **0**
- **Subtotal: 8** new nodes (replaces 1 existing topic `fundamentals-core-concepts`; receives 5 relocated leaves)

---

## 2. Networks

**Current state:** `networks → network-security` (1 topic, 33 leaves). Mixes OSI/TCP curriculum, defensive controls, identity primer, and attack techniques.

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `network-architecture-fundamentals` | Network Architecture & Protocols | Standard Network+/CCNA split: OSI/TCP-IP stack, L2/L3/L4 behavior, routing, naming — protocol knowledge separate from attacks. |
| `network-services-applications` | Network Services & Application Protocols | Protocol/service-layer prerequisite knowledge — DHCP, DNS, email — that CEH's reconnaissance modules and Security+'s network-security objectives both assume as background before attack technique. (Note: could not verify a formally named CEH/Security+ domain titled "communications and network attacks" as previously cited here — current Security+ SY0-701 has no domain by that name. Reworded to avoid citing an unconfirmed source; the underlying grouping — DNS/DHCP/email as service surfaces — is still a standard curriculum split, just not tied to one specific named domain.) |
| `network-perimeter-segmentation` | Perimeter, Segmentation & Access Control | Reflects NIST CSF 2.0 **Protect** (PR.AA — Identity Management, Authentication and Access Control; PR.PS / PR.IR — Platform Security / Technology Infrastructure Resilience, which absorbed the retired CSF 1.1 "Protective Technology" category) — firewalls, VLANs, NAT, stateful filtering, access control models at the network layer. |
| `network-reconnaissance-attacks` | Network Reconnaissance & Layer Attacks | Reflects MITRE ATT&CK **Reconnaissance**, **Discovery**, and CEH network-attack modules — footprinting, ARP/DNS attacks, L2 abuse. |
| `network-analysis-troubleshooting` | Network Analysis & Diagnostics | Reflects CySA+/practitioner tooling curricula — Wireshark, tcpdump, ICMP diagnostics as observability (distinct from Detection domain's SOC-scale monitoring). |

### Hierarchy & leaf mapping

#### `network-architecture-fundamentals`

**Topic: `osi-and-physical-layer`**  
- **Subtopic: `layer-models-and-physical`**  
  - **Existing leaves:** `osi-model-layers`, `physical-layer-line-coding`, `ethernet-frame-structure`, `medium-access-control-csma`, `error-detection-crc-arq`

**Topic: `ip-addressing-and-routing`**  
- **Subtopic: `subnetting-and-forwarding`**  
  - **Existing leaves:** `ip-subnetting`, `routing-protocols-overview`, `distance-vector-loops-split-horizon`, `nat-network-address-translation`

**Topic: `transport-layer-tcp`**  
- **Subtopic: `tcp-mechanics`**  
  - **Existing leaves:** `tcp-segment-header`, `tcp-connection-lifecycle`, `tcp-rto-estimation`, `tcp-congestion-control`, `tcp-congestion-variants`, `socket-programming-basics`

#### `network-services-applications`

**Topic: `naming-and-directory-services`**  
- **Existing leaves:** `dns-resolution-fundamentals`, `dns-zone-transfer`, `dhcp-protocol`

**Topic: `application-and-email-protocols`**  
- **Existing leaves:** `email-security-dmarc-spf-dkim`

#### `network-perimeter-segmentation`

**Topic: `firewalls-and-filtering`**  
- **Existing leaves:** `firewall-fundamentals`, `iptables-stateful-filtering`

**Topic: `segmentation-and-access-control`**  
- **Existing leaves:** `vlan-hopping`, `access-control-models`

#### `network-reconnaissance-attacks`

**Topic: `reconnaissance-and-footprinting`**  
- **Existing leaves:** `footprinting-reconnaissance-techniques`, `adversarial-thinking-threat-actors`

**Topic: `layer2-layer3-attacks`**  
- **Existing leaves:** `arp-spoofing-mitm`, `arp-poisoning-mitm`, `mac-flooding-cam-table`, `dns-cache-poisoning-basics`

#### `network-analysis-troubleshooting`

**Topic: `packet-capture-analysis`**  
- **Existing leaves:** `wireshark-hex-header-fields`, `wireshark-display-filters`, `icmp-diagnostics-ping-traceroute`

### Cross-domain relocations (from Networks → other domains)

| Leaf ID | Proposed destination | Reason |
|---|---|---|
| `identity-authentication-fundamentals` | **Identity** → `authentication-mechanisms` → `authentication-concepts` | Identity primer, not network protocol content. |

### Flags for review

| Leaf ID | Issue |
|---|---|
| `arp-spoofing-mitm` + `arp-poisoning-mitm` | Near-duplicate titles/content — keep both in plan under `layer2-layer3-attacks`; recommend merge or cross-link during content pass, not structural deletion. |
| `identity-authentication-fundamentals` | Relocate to Identity domain (see table above). |
| `adversarial-thinking-threat-actors` | Threat-actor motivation content under network recon — could relocate to **Fundamentals** → `threat-actors-and-motivation` alongside `threat-actor-sophistication`; kept under Networks for now to avoid over-consolidating Fundamentals. |

### Proposed new structural nodes (this domain)

- Subdomains: **5**
- Topics: **10**
- Subtopics: **3**
- **Subtotal: 18** new nodes (replaces 1 existing topic `network-security`)

---

## 3. Systems

**Current state:** `systems → linux-cli` (4 leaves), `software-code-security` (17 leaves). Already has 2 topics; needs subdomain layer and internal topic refinement.

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `endpoint-linux-hardening` | Endpoint & Linux Hardening | Reflects Security+ / Linux+ hardening objectives — CLI skills, SSH, privilege discovery on hosts. |
| `secure-software-lifecycle` | Secure Software Development Lifecycle | Reflects OWASP SAMM / SSDLC / CISSP Domain 8 — threat modeling, secure coding, supply chain. |
| `application-security-testing` | Application Security Testing | Reflects OWASP Testing Guide and DevSecOps toolchain categories — SAST, DAST, SCA, code review. |
| `safety-critical-systems` | Safety-Critical & High-Assurance Systems | Reflects IEC 61508 / STPA / safety engineering curricula — distinct from mainstream AppSec; legitimately deep but narrow. |

### Hierarchy & leaf mapping

#### `endpoint-linux-hardening`

**Topic: `linux-cli-fundamentals`**  
- **Existing leaves:** `overthewire-bandit-cli-reference`, `find-permission-escalation`, `grep-recursive-content-search`

**Topic: `remote-access-hardening`**  
- **Existing leaves:** `ssh-key-auth-hardening`

#### `secure-software-lifecycle`

**Topic: `threat-modeling-and-analysis`**  
- **Existing leaves:** `stride-threat-modeling`, `fault-tree-analysis`, `fmea-failure-mode-analysis`, `stpa-hazard-analysis`

**Topic: `secure-coding-practices`**  
- **Existing leaves:** `input-validation-boundaries`, `memory-safety-buffer-overruns`, `integer-overflow-wraparound`, `race-conditions-toctou`, `fail-secure-error-handling`, `security-code-review-checklist`

**Topic: `supply-chain-and-composition`**  
- **Existing leaves:** `sbom-supply-chain`, `sca-dependency-scanning`

#### `application-security-testing`

**Topic: `testing-methodologies`**  
- **Existing leaves:** `sast-dast-overview`

#### `safety-critical-systems`

**Topic: `standards-and-safety-levels`**  
- **Existing leaves:** `iec-61508-sil-levels`, `safety-critical-v-and-v`, `software-fault-tolerance-cots-hardware`

**Topic: `hazard-analysis-case-studies`**  
- **Existing leaves:** `safety-critical-hazard-case-studies`

### Flags for review

- None. All 21 leaves map within Systems.

### Proposed new structural nodes (this domain)

- Subdomains: **4**
- Topics: **8**
- Subtopics: **0**
- **Subtotal: 12** new nodes (2 existing topics `linux-cli`, `software-code-security` become subdomains or are replaced by the above IDs — implementer should migrate children, not duplicate)

---

## 4. Identity

**Current state:** `identity → identity-access-management` (1 topic, 7 leaves).

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `authentication-mechanisms` | Authentication Mechanisms | Reflects CISSP Domain 5 / NIST 800-63 — factors, passwords, Kerberos ticket flows. |
| `federation-single-sign-on` | Federation & Single Sign-On | Reflects modern IAM curricula — SAML, OIDC, SSO patterns. |
| `privileged-access-governance` | Privileged Access Governance | Reflects Gartner PAM / NIST AC-2, AC-6 — PAM, JIT, standing privilege reduction. |

### Hierarchy & leaf mapping

#### `authentication-mechanisms`

**Topic: `multi-factor-and-password-policy`**  
- **Existing leaves:** `mfa-mechanisms`, `password-policy-vs-passwordless`, `password-attack-models-online-offline`, `password-attack-mitigations` *(relocated from Offensive)*

**Topic: `kerberos-and-directory-auth`**  
- **Existing leaves:** `kerberos-ticket-flow-as-tgs-tgt`

**Topic: `authentication-concepts`** — IAM/AAA foundations  
- **Existing leaves:** `identity-authentication-fundamentals` *(relocated from Networks)*, `aaa-access-control-model` *(relocated from Offensive)*, `authentication-failure-insight` *(relocated from Offensive)*

#### `federation-single-sign-on`

**Topic: `sso-protocols`**  
- **Existing leaves:** `sso-saml-oidc-basics`

#### `privileged-access-governance`

**Topic: `pam-and-jit`**  
- **Existing leaves:** `privileged-access-management`, `just-in-time-access`

### Flags for review

| Leaf ID | Issue |
|---|---|
| `kerberos-ticket-flow-as-tgs-tgt` (Identity) vs `kerberos-protocol` (Cryptography) | Intentional cross-domain overlap — Identity focuses on ticket flow/IAM; Cryptography on protocol/crypto mechanics. Flag for cross-linking in content pass, not merge. |

### Proposed new structural nodes (this domain)

- Subdomains: **3**
- Topics: **5**
- Subtopics: **0**
- **Subtotal: 8** new nodes (receives 4 relocated leaves; replaces 1 existing topic)

---

## 5. Web Security

**Current state:** `web-security → web-security-group` (1 topic, 10 leaves).

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `web-platform-fundamentals` | Web Platform Fundamentals | Reflects OWASP Testing Guide "Information Gathering" / server configuration chapters — HTTP stack, server config, attack surface taxonomy. |
| `injection-and-input-attacks` | Injection & Input Attacks | Reflects OWASP Top 10 **A05:2025 Injection** (this was A03 in the retired 2021 edition — OWASP Top 10:2025 renumbered it) and WSTG input validation sections. |
| `client-side-attacks` | Client-Side Attacks | XSS is folded into OWASP Top 10 **A05:2025 Injection** in the current edition (no standalone XSS category since 2021); this subdomain keeps XSS/client-execution split out separately for teaching granularity, plus client-side storage/session abuse. |
| `session-and-request-forgery` | Session Management & Request Forgery | Reflects OWASP Top 10 session/auth categories and CSRF testing guide sections. |
| `web-hardening-defense` | Web Hardening & Defensive Controls | Reflects OWASP ASVS / server hardening baselines and WAF placement (distinct from network firewalls). |

### Hierarchy & leaf mapping

#### `web-platform-fundamentals`

**Topic: `http-server-basics`**  
- **Existing leaves:** `web-fundamentals-server-config`, `web-server-attack-categories`, `owasp-top10-overview`

**Topic: `web-application-firewalls`**  
- **Existing leaves:** `firewall-vendor-landscape`

#### `injection-and-input-attacks`

**Topic: `sql-injection`**  
- **Existing leaves:** `sql-injection-union`

#### `client-side-attacks`

**Topic: `xss-and-client-execution`**  
- **Existing leaves:** `xss-reflected-stored`, `client-side-web-attacks`

#### `session-and-request-forgery`

**Topic: `session-hijacking-and-csrf`**  
- **Existing leaves:** `cookie-poisoning-session-hijack`, `csrf-token-defense`

#### `web-hardening-defense`

**Topic: `server-hardening-baselines`**  
- **Existing leaves:** `web-hardening-baseline-apache-iis`

### Flags for review

- None. All 10 leaves map cleanly.

### Proposed new structural nodes (this domain)

- Subdomains: **5**
- Topics: **6**
- Subtopics: **0**
- **Subtotal: 11** new nodes (replaces 1 existing topic)

---

## 6. Cloud Security

**Current state:** `cloud-security → cloud-infrastructure` (1 topic, 17 leaves). Heavy AWS skew; includes two loosely related leaves.

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `cloud-governance-models` | Cloud Governance & Shared Responsibility | Reflects CSA CCM and NIST CSF cloud overlay — shared responsibility, org guardrails, benchmarks. |
| `cloud-identity-access` | Cloud Identity & Access Management | Reflects CIS AWS Benchmark IAM sections and CISSP cloud access control — IAM, SCPs, KMS. |
| `cloud-network-compute` | Cloud Network & Compute Hardening | Reflects well-established IaaS hardening curricula — VPC, EC2, Lambda execution roles. |
| `cloud-data-secrets` | Cloud Data Protection & Secrets | Reflects data-security controls — S3 exposure, secrets managers, DLP concepts in cloud context. |
| `cloud-workloads-containers` | Cloud Workloads, Containers & Orchestration | Reflects CNCF / Kubernetes security fundamentals — image scanning, K8s RBAC. |
| `cloud-threat-detection` | Cloud Threat Detection & Logging | Reflects NIST CSF **Detect** for cloud — CloudTrail, CloudWatch, GuardDuty. |

### Hierarchy & leaf mapping

#### `cloud-governance-models`

**Topic: `shared-responsibility-and-benchmarks`**  
- **Existing leaves:** `cloud-shared-responsibility`, `cis-cloud-benchmarks`, `aws-organizations-scp`

#### `cloud-identity-access`

**Topic: `iam-and-key-management`**  
- **Existing leaves:** `aws-iam-least-privilege`, `aws-kms-key-management`

#### `cloud-network-compute`

**Topic: `network-isolation-and-compute`**  
- **Existing leaves:** `aws-vpc-security-groups`, `ec2-instance-hardening`, `lambda-security-execution-role`

#### `cloud-data-secrets`

**Topic: `storage-and-secrets`**  
- **Existing leaves:** `s3-public-bucket-exposure`, `secrets-manager-parameter-store`, `data-loss-water-analogy`

#### `cloud-workloads-containers`

**Topic: `containers-and-kubernetes`**  
- **Existing leaves:** `container-image-scanning`, `kubernetes-rbac-basics`

**Topic: `application-platform-security`**  
- **Existing leaves:** `cms-security-model`

#### `cloud-threat-detection`

**Topic: `logging-and-detection-services`**  
- **Existing leaves:** `cloudtrail-logging`, `cloudwatch-security-alarms`, `aws-guardduty-overview`

### Flags for review

| Leaf ID | Issue |
|---|---|
| `cms-security-model` | CMS is not cloud-specific — placed under `cloud-workloads-containers` as SaaS/PaaS application surface. Consider future **Web Security** cross-link or move to Web if a SaaS branch is added. |
| `data-loss-water-analogy` | Conceptual DLP metaphor, not AWS-specific — fits `cloud-data-secrets` as data-protection framing; could alternatively live under **Cryptography** DLP or **GRC** data governance. |

### Proposed new structural nodes (this domain)

- Subdomains: **6**
- Topics: **7**
- Subtopics: **0**
- **Subtotal: 13** new nodes (replaces 1 existing topic)

---

## 7. Detection & Monitoring

**Current state:** 3 topics — `digital-forensics` (5), `intrusion-detection-monitoring` (14), `incident-response` (15). Best existing depth; add subdomain layer and refine topic grouping.

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `digital-forensics` | Digital Forensics | Reflects NIST SP 800-86 / SANS FOR500 domain breakdown — acquisition, memory, chain of custody, tool validation. |
| `security-operations-monitoring` | Security Operations & Monitoring | Reflects NIST CSF **Detect** and CySA+ — IDS/IPS, SIEM, EDR, SOC operations, log prioritization. |
| `incident-response` | Incident Response | Reflects NIST SP 800-61 / SANS IR phases — preparation through recovery, metrics, communications. |

*(These align with existing topic names; implementation promotes current topics to subdomain level under the domain.)*

### Hierarchy & leaf mapping

#### `digital-forensics`

**Topic: `evidence-handling`**  
- **Existing leaves:** `chain-of-custody`, `legal-issues-cybersecurity`, `forensic-tool-validation-black-box-defense`

**Topic: `forensic-acquisition-analysis`**  
- **Existing leaves:** `disk-imaging-dd`, `memory-forensics-volatility`

#### `security-operations-monitoring`

**Topic: `ids-ips-architecture`**  
- **Existing leaves:** `ids-functional-components`, `ids-deployment-types`, `ids-analysis-methods`, `snort-signature-basics`

**Topic: `detection-engineering`**  
- **Existing leaves:** `sigma-detection-rules`, `tripwire-file-integrity-monitoring`

**Topic: `siem-and-correlation`**  
- **Existing leaves:** `siem-correlation-use-cases`, `log-source-prioritization`, `unix-logging-fundamentals`

**Topic: `endpoint-and-network-visibility`**  
- **Subtopic: `network-visibility-tools`**  
  - **Existing leaves:** `tcpdump-cli-packet-analysis`
- **Subtopic: `endpoint-detection`**  
  - **Existing leaves:** `edr-vs-traditional-av`

**Topic: `soc-operations`**  
- **Existing leaves:** `soc-tiering-escalation`, `alert-triage-prioritization`, `honeypots-honeynets-padded-cell`

#### `incident-response`

**Topic: `ir-lifecycle`**  
- **Existing leaves:** `ir-lifecycle-nist`, `containment-strategies`, `ir-eradication`, `ir-recovery-monitoring`

**Topic: `ir-preparation`**  
- **Existing leaves:** `ir-preparation-runbooks`, `ir-tabletop-exercises`

**Topic: `ir-detection-and-triage`**  
- **Existing leaves:** `ir-detection-triage`, `ir-threat-hunting`

**Topic: `ir-evidence-and-reporting`**  
- **Existing leaves:** `ir-evidence-preservation`, `post-incident-reporting`, `ir-root-cause-analysis`

**Topic: `ir-governance-and-comms`**  
- **Existing leaves:** `ir-stakeholder-comms`, `ir-regulatory-notification`, `ir-ioc-sharing`, `ir-metrics-mttd-mttr`

### Flags for review

| Leaf ID | Issue |
|---|---|
| `legal-issues-cybersecurity` | User previously skipped legal/statute content for CEH extraction — leaf still exists. Placed under forensics evidence-handling (standard DFIR curricula include legal admissibility). Flag whether to **deprecate content** in a later pass vs keep. |
| `honeypots-honeynets-padded-cell` (Detection) vs `honeypots` (Offensive) | Duplicate topic across domains — intentional split (defensive deployment vs offensive decoy use) but needs cross-linking. |

### Proposed new structural nodes (this domain)

- Subdomains: **0** (promote 3 existing topics — no new subdomain IDs)
- Topics: **12** (new intermediate grouping under promoted subdomains)
- Subtopics: **2**
- **Subtotal: 14** new nodes

---

## 8. Offensive Security

**Current state:** 3 topics — `exploitation-vulnerability` (14, includes misplaced fundamentals), `reconnaissance-osint` (4), `offensive-wireless-attacks` (4).

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `reconnaissance-osint` | Reconnaissance & OSINT | Reflects MITRE ATT&CK **Reconnaissance** tactic and PTES pre-engagement phases. |
| `vulnerability-exploitation` | Vulnerability Analysis & Exploitation | Reflects CEH / PenTest+ exploitation modules and MITRE **Execution**, **Privilege Escalation** — vuln research, memory corruption, tooling scope. |
| `post-exploitation-persistence` | Post-Exploitation & Persistence | Reflects MITRE **Persistence**, **Command and Control** — backdoors, priv esc paths, framework abuse. |
| `offensive-wireless-attacks` | Wireless Offensive Operations | Reflects CEH wireless attack domain — evil twin, legacy WEP, Bluetooth families, wardriving. |

*(Promote existing topics to subdomain level; split `exploitation-vulnerability` into focused topics and relocate non-offensive leaves.)*

### Hierarchy & leaf mapping

#### `reconnaissance-osint`

**Topic: `passive-and-active-recon`**  
- **Existing leaves:** `osint-passive-recon-toolkit`, `nmap-scanning-reference`, `shodan-asset-discovery`, `google-dorking`

#### `vulnerability-exploitation`

**Topic: `memory-and-binary-exploitation`**  
- **Existing leaves:** `buffer-overflow-stack-layout`, `rop-chains-basics`, `spectre-meltdown-primer`

**Topic: `exploitation-frameworks-and-scope`**  
- **Existing leaves:** `metasploit-autopwn-risk-and-scope`

#### `post-exploitation-persistence`

**Topic: `privilege-escalation-and-backdoors`**  
- **Existing leaves:** `privilege-escalation-paths-unpatched-software`, `command-shell-backdoors-netcat`

**Topic: `deception-and-honeypots`**  
- **Existing leaves:** `honeypots`

#### `offensive-wireless-attacks`

**Topic: `wireless-access-attacks`**  
- **Existing leaves:** `wireless-evil-twin-rogue-ap`, `wep-cracking-legacy-risk`, `wardriving-recon-exposure`, `bluetooth-attack-families`

### Cross-domain relocations (from Offensive → Fundamentals / Identity / Networks)

| Leaf ID | Proposed destination | Reason |
|---|---|---|
| `security-core-vocabulary` | **Fundamentals** → `risk-threat-landscape` → `risk-quantification` | Core vocabulary, not offensive technique. |
| `aaa-access-control-model` | **Identity** → `authentication-mechanisms` → `authentication-concepts` | AAA is IAM architecture. |
| `information-assurance-pillars` | **Fundamentals** → `security-principles-models` → `assurance-foundations` | Assurance model, not exploitation. |
| `password-attack-mitigations` | **Identity** → `authentication-mechanisms` → `multi-factor-and-password-policy` | Defensive auth content miscategorized under offensive. |
| `threat-actor-sophistication` | **Fundamentals** → `risk-threat-landscape` → new topic `threat-actors-and-motivation` | Adversary taxonomy belongs in threat landscape. |
| `attack-surface-access-vectors` | **Fundamentals** → `risk-threat-landscape` → `threat-actors-and-motivation` *(or new topic `attack-surface`)* | Attack surface framing is pre-offensive risk context. |
| `authentication-failure-insight` | **Identity** → `authentication-mechanisms` → `authentication-concepts` | Auth failure analysis, not exploitation. |

### Flags for review

- Seven leaves relocated out of Offensive — improves taxonomy but changes domain counts on the mindmap. Confirm UX expectation.
- `spectre-meltdown-primer` — side-channel/hardware; could alternatively sit under **Systems** memory safety — kept under exploitation as CEH-style "advanced attacks."

### Proposed new structural nodes (this domain)

- Subdomains: **1** net new (`post-exploitation-persistence`; `vulnerability-exploitation` replaces `exploitation-vulnerability`; other two topics promoted)
- Topics: **6** new under reorganized subdomains
- Subtopics: **0**
- **Subtotal: 7** new nodes (+ subdomain ID split/rename logic for implementer)

---

## 9. Malware & RE

**Current state:** `malware-re → malware-threat` (1 topic, 9 leaves). Mixes taxonomy, analysis methods, ATT&CK, fraud case studies.

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `malware-classification-campaigns` | Malware Classification & Campaigns | Reflects SANS FOR610 / malware taxonomy curricula — families, ransomware, mobile banking trojans. |
| `malware-analysis-methods` | Malware Analysis Methods | Reflects RE workflow standard — static vs dynamic, YARA signatures. |
| `threat-intelligence-attck` | Threat Intelligence & ATT&CK Mapping | Reflects MITRE ATT&CK and CTI practitioner frameworks — tactic mapping, adversary goals. |
| `fraud-and-social-malware` | Fraud, Scams & Social Engineering Malware | Reflects FBI IC3 / phishing-BEC curricula — non-traditional "malware" delivery via deception (distinct from pure RE). |

### Hierarchy & leaf mapping

#### `malware-classification-campaigns`

**Topic: `malware-taxonomy-and-families`**  
- **Existing leaves:** `malware-taxonomy`, `mobile-banking-trojan-case-study`

**Topic: `cyber-physical-and-disruption`**  
- **Existing leaves:** `cyber-physical-attack-case-studies`

#### `malware-analysis-methods`

**Topic: `analysis-workflows`**  
- **Existing leaves:** `static-vs-dynamic-malware-analysis`, `yara-rule-basics`

#### `threat-intelligence-attck`

**Topic: `adversary-goals-and-frameworks`**  
- **Existing leaves:** `cyber-adversary-goals-taxonomy`, `mitre-attck-mapping`

#### `fraud-and-social-malware`

**Topic: `scams-and-bec`**  
- **Existing leaves:** `browser-lock-tech-support-scams`, `business-email-compromise-deep-dive`

### Flags for review

- None required. Case-study leaves remain as leaves (Case Studies **domain** was removed; content stays as exemplar leaves here).

### Proposed new structural nodes (this domain)

- Subdomains: **4**
- Topics: **5**
- Subtopics: **0**
- **Subtotal: 9** new nodes (replaces 1 existing topic)

---

## 10. Cryptography

**Current state:** `cryptography → cryptography-group` (1 topic, 12 leaves). Several leaves are identity/network/adversary content miscategorized under crypto.

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `cryptographic-primitives` | Cryptographic Primitives & Algorithms | Reflects CISSP Domain 3 — symmetric/asymmetric, hashing, modes (GCM vs CBC). |
| `pki-and-transport-security` | PKI & Transport Security | Reflects TLS/PKI curricula — X.509, handshake, certificate validation, PGP. |
| `authentication-cryptography` | Authentication & Credential Cryptography | Reflects applied auth crypto — Kerberos protocol mechanics, password hashing/storage, hardware tokens. |
| `data-protection-cryptography` | Data Protection Controls | Reflects DLP and data-centric security — cryptographic and procedural data loss controls. |

### Hierarchy & leaf mapping

#### `cryptographic-primitives`

**Topic: `algorithm-fundamentals`**  
- **Existing leaves:** `cryptography-fundamentals`, `aes-modes-gcm-vs-cbc`

#### `pki-and-transport-security`

**Topic: `pki-certificates`**  
- **Existing leaves:** `pki-public-key-infrastructure`, `tls-handshake-cert-validation`, `pgp-encryption-flow`

#### `authentication-cryptography`

**Topic: `kerberos-and-token-auth`**  
- **Existing leaves:** `kerberos-protocol`, `authentication-technologies-hardware`, `unix-password-storage-cracking`

**Topic: `authentication-architecture`**  
- **Existing leaves:** `host-user-authentication-directions`, `implementation-failure-category`

#### `data-protection-cryptography`

**Topic: `data-loss-prevention`**  
- **Existing leaves:** `dlp-five-cs-data-protection`

*(Leaf `adversary-target-system-categories` relocates to Fundamentals — see Cross-Domain Relocation Summary.)*

### Flags for review

| Leaf ID | Issue |
|---|---|
| `kerberos-protocol` (Crypto) vs `kerberos-ticket-flow-as-tgs-tgt` (Identity) | Complementary split — keep both with cross-links. |
| `authentication-technologies-hardware` | Spans crypto and IAM — placed under crypto as token/crypto device mechanisms. |

### Proposed new structural nodes (this domain)

- Subdomains: **4**
- Topics: **5**
- Subtopics: **0**
- **Subtotal: 9** new nodes (replaces 1 existing topic)

---

## 11. Governance / Risk / Compliance

**Current state:** `governance-risk-compliance → grc-fundamentals` (1 topic, 6 leaves).

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `governance-frameworks` | Governance & Security Frameworks | Reflects NIST CSF governance tier, ISO 27001 clauses, SOC 2 — framework selection and structure. |
| `risk-management` | Risk Management | Reflects ISO 31000 / NIST RMF — risk registers, vendor/third-party risk. |
| `regulatory-compliance` | Regulatory & Industry Compliance | Reflects PCI-DSS, HIPAA, GDPR driver mapping — compliance by sector. |
| `security-assessment-programs` | Security Assessment Programs | Reflects PTES / NIST SP 800-115 — vulnerability assessment vs penetration testing, rules of engagement. |

### Hierarchy & leaf mapping

#### `governance-frameworks`

**Topic: `frameworks-overview`**  
- **Existing leaves:** `compliance-frameworks-overview`

#### `risk-management`

**Topic: `risk-register-and-vendors`**  
- **Existing leaves:** `risk-register-basics`, `third-party-vendor-risk`

#### `regulatory-compliance`

**Topic: `industry-compliance-drivers`**  
- **Existing leaves:** `compliance-drivers-by-industry`

#### `security-assessment-programs`

**Topic: `assessment-types-and-engagement`**  
- **Existing leaves:** `vulnerability-assessment-vs-penetration-test`, `penetration-test-scope-rules-of-engagement`

### Flags for review

- None. All 6 leaves map cleanly. Domain is intentionally shallow in **depth** (4 subdomains, 4 topics) because current leaf inventory is small — structure is real but not padded.

### Proposed new structural nodes (this domain)

- Subdomains: **4**
- Topics: **4**
- Subtopics: **0**
- **Subtotal: 8** new nodes (replaces 1 existing topic)

---

## 12. Tools

**Current state:** `tools → tools-security-landscape` (1 topic, 3 leaves). Thinnest domain.

### Proposed subdomains

| ID | Title | Reasoning |
|---|---|---|
| `detection-response-platforms` | Detection & Response Platforms | Reflects SOC tooling market categories — SIEM, EDR, SOAR as platform classes (comparison-oriented). |

### Hierarchy & leaf mapping

#### `detection-response-platforms`

**Topic: `siem-platforms`**  
- **Existing leaves:** `siem-platform-comparison`

**Topic: `edr-platforms`**  
- **Existing leaves:** `edr-platform-comparison`

**Topic: `soar-and-workflow`**  
- **Existing leaves:** `soar-ticketing-basics`

### Flags for review

- **Insufficient inventory for multi-subdomain depth** — only 3 leaves. Single subdomain with 3 topics is the honest structure. Do **not** invent subdomains for Wireshark, Nmap, Metasploit, etc.; those tools already live as leaves or tool entries under Networks, Offensive, Detection.

### Proposed new structural nodes (this domain)

- Subdomains: **1**
- Topics: **3**
- Subtopics: **0**
- **Subtotal: 4** new nodes (replaces 1 existing topic)

---

## Cross-Domain Relocation Summary

| Leaf ID | From | To |
|---|---|---|
| `identity-authentication-fundamentals` | Networks | Identity → `authentication-mechanisms` → `authentication-concepts` |
| `security-core-vocabulary` | Offensive | Fundamentals → `risk-threat-landscape` → `risk-quantification` |
| `information-assurance-pillars` | Offensive | Fundamentals → `security-principles-models` → `assurance-foundations` |
| `threat-actor-sophistication` | Offensive | Fundamentals → `risk-threat-landscape` → `threat-actors-and-motivation` |
| `attack-surface-access-vectors` | Offensive | Fundamentals → `risk-threat-landscape` → `threat-actors-and-motivation` |
| `aaa-access-control-model` | Offensive | Identity → `authentication-mechanisms` → `authentication-concepts` |
| `password-attack-mitigations` | Offensive | Identity → `authentication-mechanisms` → `multi-factor-and-password-policy` |
| `authentication-failure-insight` | Offensive | Identity → `authentication-mechanisms` → `authentication-concepts` |
| `adversary-target-system-categories` | Cryptography | Fundamentals → `risk-threat-landscape` → `threat-actors-and-motivation` |

**Relocated leaf count: 9** (all accounted for; no orphaned leaves).

---

## Duplicate / Overlap Review List

| Pair | Recommendation |
|---|---|
| `arp-spoofing-mitm` / `arp-poisoning-mitm` | Same branch; merge or cross-link in content pass. |
| `honeypots` (Offensive) / `honeypots-honeynets-padded-cell` (Detection) | Keep both; cross-link defensive vs offensive framing. |
| `kerberos-protocol` / `kerberos-ticket-flow-as-tgs-tgt` | Keep both; cross-link crypto vs IAM framing. |
| `footprinting-reconnaissance-techniques` (Networks) / OSINT leaves (Offensive) | Adjacent; cross-link at content pass. |

---

## Implementation Notes (for downstream AI / implementer)

1. **Promote vs replace:** For Detection, Offensive, and Systems, existing `type: "topic"` nodes at depth 2 can become subdomains (still `type: "topic"`) with new child topics inserted — avoid duplicating IDs.
2. **Alphabetical sort:** Mindmap sorts siblings alphabetically by title — new titles will reorder UI; no code change expected.
3. **Related arrays:** After moves, audit `related[]` on relocated leaves for stale domain references (pattern established in prior domain-removal pass).
4. **No new leaves in this pass:** Proposed topics/subtopics may have empty `children: []` until content pass.
5. **Depth variance example:** Tools ends at 4 levels (domain → subdomain → topic → leaf). Networks uses 5 levels where subtopics exist (domain → subdomain → topic → subtopic → leaf).

---

## Summary

### Proposed new structural node counts

| Domain | Subdomains | Topics | Subtopics | New nodes |
|---|---:|---:|---:|---:|
| Fundamentals | 3 | 5* | 0 | 8 |
| Networks | 5 | 10 | 3 | 18 |
| Systems | 4 | 8 | 0 | 12 |
| Identity | 3 | 5 | 0 | 8 |
| Web Security | 5 | 6 | 0 | 11 |
| Cloud Security | 6 | 7 | 0 | 13 |
| Detection & Monitoring | 0† | 12 | 2 | 14 |
| Offensive Security | 1‡ | 6 | 0 | 7 |
| Malware & RE | 4 | 5 | 0 | 9 |
| Cryptography | 4 | 5 | 0 | 9 |
| GRC | 4 | 4 | 0 | 8 |
| Tools | 1 | 3 | 0 | 4 |
| **Totals** | **40** | **76** | **5** | **121** |

\*Fundamentals includes **+1** new topic `threat-actors-and-motivation` for relocated leaves (counted in Topics column as 5, not 4).

†Detection **promotes existing topics** to subdomain level; new node count is topics/subtopics only.

‡Offensive **promotes** `reconnaissance-osint` and `offensive-wireless-attacks`; **splits** `exploitation-vulnerability` into `vulnerability-exploitation` + `post-exploitation-persistence` (+1 net subdomain ID).

**Grand total proposed new structural nodes: 121** (subdomains + topics + subtopics).

**Existing topic nodes superseded:** 12 shallow bucket topics (e.g. `fundamentals-core-concepts`, `network-security`, `web-security-group`) plus topic-level reorganization in Detection/Offensive/Systems — implementer removes or reparents, does not leave parallel.

**Existing leaves preserved:** **180** (9 change domain assignment; 0 deleted). Post-relocation counts: Fundamentals **11**, Networks **32**, Systems **21**, Identity **11**, Web **10**, Cloud **17**, Detection **34**, Offensive **15**, Malware **9**, Cryptography **11**, GRC **6**, Tools **3**.

### Domains with limited legitimate depth (honest assessment)

| Domain | Assessment |
|---|---|
| **Tools** | Only **3** leaves. Real-world SOC tooling taxonomy supports one subdomain and three platform-class topics — **not** enough inventory for 5+ subdomains without inventing empty tool silos. Tool-specific nodes belong under operational domains. |
| **GRC** | Framework structure is real (4 subdomains) but **only 6 leaves** — depth is modest by necessity until more compliance/risk content is authored. |
| **Fundamentals** | Conceptually broad field, but **only 6 native leaves** (+3 relocated) — structure is sound; many proposed topics will be sparse until content pass. |
| **Identity** | Standard IAM curriculum supports the proposed shape, but **8 leaves** total after relocation — several topics will have single-leaf occupancy (acceptable; not padded with fake subtopics). |

### Domains with strongest depth justification

| Domain | Assessment |
|---|---|
| **Networks** | 33 leaves spanning OSI through attacks — supports 5 subdomains and selective subtopics. |
| **Detection & Monitoring** | 34 leaves across DFIR, SOC, IR — already multi-topic; benefits most from topic/subtopic layering. |
| **Systems** | 21 leaves with a clear split between endpoint CLI, AppSec SDLC, and safety-critical engineering. |
| **Cloud Security** | 17 leaves — AWS-heavy but maps cleanly to CSA/CCM-style groupings. |

---

## Appendix: Complete Leaf Inventory by Proposed Domain (post-relocation)

| Domain | Leaf count | Notes |
|---|---:|---|
| Fundamentals | 11 | 6 native + 5 relocated in |
| Networks | 32 | 33 native − 1 relocated out |
| Systems | 21 | unchanged |
| Identity | 11 | 7 native + 4 relocated in |
| Web Security | 10 | unchanged |
| Cloud Security | 17 | unchanged |
| Detection & Monitoring | 34 | unchanged |
| Offensive Security | 15 | 22 native − 7 relocated out |
| Malware & RE | 9 | unchanged |
| Cryptography | 11 | 12 native − 1 relocated out |
| GRC | 6 | unchanged |
| Tools | 3 | unchanged |
| **Total** | **180** | |

### Fundamentals (11)

`cia-triad`, `defense-in-depth`, `zero-trust-model`, `information-assurance-pillars`, `risk-threat-vulnerability-impact`, `security-core-vocabulary`, `threat-actor-sophistication`, `attack-surface-access-vectors`, `adversary-target-system-categories`, `security-control-types`, `least-privilege-principle`

### Offensive Security (15)

`buffer-overflow-stack-layout`, `rop-chains-basics`, `spectre-meltdown-primer`, `privilege-escalation-paths-unpatched-software`, `metasploit-autopwn-risk-and-scope`, `command-shell-backdoors-netcat`, `honeypots`, `osint-passive-recon-toolkit`, `nmap-scanning-reference`, `shodan-asset-discovery`, `google-dorking`, `wireless-evil-twin-rogue-ap`, `wep-cracking-legacy-risk`, `wardriving-recon-exposure`, `bluetooth-attack-families`

### Networks (32)

`osi-model-layers`, `physical-layer-line-coding`, `ethernet-frame-structure`, `medium-access-control-csma`, `error-detection-crc-arq`, `ip-subnetting`, `routing-protocols-overview`, `distance-vector-loops-split-horizon`, `nat-network-address-translation`, `tcp-segment-header`, `tcp-connection-lifecycle`, `tcp-rto-estimation`, `tcp-congestion-control`, `tcp-congestion-variants`, `socket-programming-basics`, `dns-resolution-fundamentals`, `dns-zone-transfer`, `dhcp-protocol`, `email-security-dmarc-spf-dkim`, `firewall-fundamentals`, `iptables-stateful-filtering`, `vlan-hopping`, `access-control-models`, `footprinting-reconnaissance-techniques`, `adversarial-thinking-threat-actors`, `arp-spoofing-mitm`, `arp-poisoning-mitm`, `mac-flooding-cam-table`, `dns-cache-poisoning-basics`, `wireshark-hex-header-fields`, `wireshark-display-filters`, `icmp-diagnostics-ping-traceroute`

### Systems (21)

`overthewire-bandit-cli-reference`, `find-permission-escalation`, `grep-recursive-content-search`, `ssh-key-auth-hardening`, `stride-threat-modeling`, `fault-tree-analysis`, `fmea-failure-mode-analysis`, `stpa-hazard-analysis`, `input-validation-boundaries`, `memory-safety-buffer-overruns`, `integer-overflow-wraparound`, `race-conditions-toctou`, `fail-secure-error-handling`, `security-code-review-checklist`, `sbom-supply-chain`, `sca-dependency-scanning`, `sast-dast-overview`, `iec-61508-sil-levels`, `safety-critical-v-and-v`, `software-fault-tolerance-cots-hardware`, `safety-critical-hazard-case-studies`

### Identity (11)

`mfa-mechanisms`, `password-policy-vs-passwordless`, `password-attack-models-online-offline`, `password-attack-mitigations`, `kerberos-ticket-flow-as-tgs-tgt`, `identity-authentication-fundamentals`, `aaa-access-control-model`, `authentication-failure-insight`, `sso-saml-oidc-basics`, `privileged-access-management`, `just-in-time-access`

### Web Security (10)

`web-fundamentals-server-config`, `web-server-attack-categories`, `owasp-top10-overview`, `firewall-vendor-landscape`, `sql-injection-union`, `xss-reflected-stored`, `client-side-web-attacks`, `cookie-poisoning-session-hijack`, `csrf-token-defense`, `web-hardening-baseline-apache-iis`

### Cloud Security (17)

`cloud-shared-responsibility`, `cis-cloud-benchmarks`, `aws-organizations-scp`, `aws-iam-least-privilege`, `aws-kms-key-management`, `aws-vpc-security-groups`, `ec2-instance-hardening`, `lambda-security-execution-role`, `s3-public-bucket-exposure`, `secrets-manager-parameter-store`, `data-loss-water-analogy`, `container-image-scanning`, `kubernetes-rbac-basics`, `cms-security-model`, `cloudtrail-logging`, `cloudwatch-security-alarms`, `aws-guardduty-overview`

### Detection & Monitoring (34)

`chain-of-custody`, `legal-issues-cybersecurity`, `forensic-tool-validation-black-box-defense`, `disk-imaging-dd`, `memory-forensics-volatility`, `ids-functional-components`, `ids-deployment-types`, `ids-analysis-methods`, `snort-signature-basics`, `sigma-detection-rules`, `tripwire-file-integrity-monitoring`, `siem-correlation-use-cases`, `log-source-prioritization`, `unix-logging-fundamentals`, `tcpdump-cli-packet-analysis`, `edr-vs-traditional-av`, `soc-tiering-escalation`, `alert-triage-prioritization`, `honeypots-honeynets-padded-cell`, `ir-lifecycle-nist`, `containment-strategies`, `ir-eradication`, `ir-recovery-monitoring`, `ir-preparation-runbooks`, `ir-tabletop-exercises`, `ir-detection-triage`, `ir-threat-hunting`, `ir-evidence-preservation`, `post-incident-reporting`, `ir-root-cause-analysis`, `ir-stakeholder-comms`, `ir-regulatory-notification`, `ir-ioc-sharing`, `ir-metrics-mttd-mttr`

### Malware & RE (9)

`malware-taxonomy`, `mobile-banking-trojan-case-study`, `cyber-physical-attack-case-studies`, `static-vs-dynamic-malware-analysis`, `yara-rule-basics`, `cyber-adversary-goals-taxonomy`, `mitre-attck-mapping`, `browser-lock-tech-support-scams`, `business-email-compromise-deep-dive`

### Cryptography (11)

`cryptography-fundamentals`, `aes-modes-gcm-vs-cbc`, `pki-public-key-infrastructure`, `tls-handshake-cert-validation`, `pgp-encryption-flow`, `kerberos-protocol`, `authentication-technologies-hardware`, `unix-password-storage-cracking`, `host-user-authentication-directions`, `implementation-failure-category`, `dlp-five-cs-data-protection`

### GRC (6)

`compliance-frameworks-overview`, `risk-register-basics`, `third-party-vendor-risk`, `compliance-drivers-by-industry`, `vulnerability-assessment-vs-penetration-test`, `penetration-test-scope-rules-of-engagement`

### Tools (3)

`siem-platform-comparison`, `edr-platform-comparison`, `soar-ticketing-basics`