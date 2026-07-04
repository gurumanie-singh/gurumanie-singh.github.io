# Cybersecurity Knowledge Base — Leaf Content Draft

**Document purpose:** Content-authoring pass for `data/cybersecurity.json` leaf nodes, following the structure defined in `STRUCTURE-PLAN.md`. This is the "later pass" that document explicitly deferred — actual `summary` / `core_idea` / `bullets` / `related` content for each leaf, not just hierarchy.

**Grounding source:** Verified general cybersecurity knowledge (by request) — **not** drawn from the user's actual course notes or the current live content of `cybersecurity.json`, since neither was available in this session. Content below is restricted to stable, well-established concepts (textbook/CompTIA/CISSP-level fundamentals) rather than anything likely to vary by specific course or change over time, to keep the fabrication risk as low as reasonably possible given the source constraint. **Recommend a human/course-notes pass to check tone and specifics before this replaces anything live.**

**Status:** All 12 domains complete (180 leaves). Domains 1–6 authored directly; domains 7–9 adapted from a Perplexity pass with claims re-verified (NIST SP 800-61r3, PCI DSS 4.0 dates) rather than trusted as-is; domains 10–12 rebuilt from scratch after Perplexity's structure for those three didn't match the real hierarchy (see notes at each section).

**Field schema used below:** `type`, `summary`, `core_idea`, `bullets`, `related`. These are the fields named in `STRUCTURE-PLAN.md`'s context section (which also notes "etc." — there may be additional fields in the live schema this draft doesn't know about; reconcile against the actual JSON before merging).

**On `related` links:** Populated only with leaf IDs confirmed to actually exist per the leaf inventory in the corrected `STRUCTURE-PLAN.md` — no invented IDs. These are suggested cross-links, not a reflection of whatever `related[]` values may already exist live; check for conflicts before overwriting.

---

## 1. Fundamentals

### `security-principles-models` → `assurance-foundations`

#### `cia-triad` — CIA Triad
- **type:** concept
- **summary:** The three foundational properties information security aims to protect: Confidentiality (data isn't disclosed to unauthorized parties), Integrity (data isn't altered without authorization), and Availability (data and systems are accessible to authorized users when needed). Nearly every security control maps back to protecting one or more of these.
- **core_idea:** Every security control exists to protect confidentiality, integrity, or availability — if you can't say which, you don't understand the control yet.
- **bullets:**
  - Confidentiality: encryption, access controls, need-to-know
  - Integrity: hashing, checksums, digital signatures, version control
  - Availability: redundancy, backups, DDoS mitigation, failover
  - Trade-offs exist between the three (e.g. heavy encryption can slow availability)
  - Sometimes extended to the "Parkerian Hexad," which adds possession/control, authenticity, and utility
- **related:** `information-assurance-pillars`, `security-control-types`, `defense-in-depth`

#### `information-assurance-pillars` — Information Assurance (5 Pillars)
- **type:** concept
- **summary:** A broader model than the CIA triad, used heavily in DoD/government IA doctrine. Adds Authentication and Non-repudiation to Confidentiality, Integrity, and Availability, covering not just data protection but proof of identity and proof of action.
- **core_idea:** IA is CIA plus "prove who you are" and "prove you can't deny doing it."
- **bullets:**
  - Confidentiality, Integrity, Availability — same as the CIA triad
  - Authentication: verifying an identity is genuine before granting access
  - Non-repudiation: an action can't be credibly denied after the fact (e.g. signed logs, digital signatures)
  - Rooted in US DoD Information Assurance doctrine, widely referenced in government/military security training
  - More granular than the CIA triad alone — useful when identity and accountability matter as much as data protection
- **related:** `cia-triad`, `least-privilege-principle`

### `security-principles-models` → `defense-architecture`

#### `defense-in-depth` — Defense in Depth
- **type:** concept
- **summary:** A layered security strategy: no single control is assumed to be perfect, so multiple independent layers are stacked so that if one fails, others still stand between an attacker and the target.
- **core_idea:** Assume every individual control will eventually fail — the layers are what protect you, not any one wall.
- **bullets:**
  - Classic layers: physical → network → host → application → data
  - Redundancy of *different* control types matters more than duplicating the same control
  - Analogy: castle defenses — moat, walls, guards, inner keep, not just one gate
  - Contrasts with relying on a single "hard shell, soft center" perimeter
  - Still relevant under zero trust — depth and "never trust" aren't mutually exclusive
- **related:** `zero-trust-model`, `security-control-types`, `firewall-fundamentals`

#### `zero-trust-model` — Zero Trust Model
- **type:** concept
- **summary:** A security model built on "never trust, always verify" — no user, device, or network segment is trusted by default, even inside the traditional perimeter. Every request is authenticated, authorized, and encrypted based on context, not location.
- **core_idea:** Being "inside the network" should grant zero implicit trust — trust is earned per-request, not per-location.
- **bullets:**
  - Core tenets: verify explicitly, use least-privilege access, assume breach
  - Formalized in NIST SP 800-207 (Zero Trust Architecture)
  - Replaces the older "castle-and-moat" perimeter model, which assumed anything inside the firewall was safe
  - Relies heavily on strong identity verification, micro-segmentation, and continuous monitoring
  - Doesn't eliminate the need for defense in depth — it changes *where* trust decisions get made
- **related:** `defense-in-depth`, `least-privilege-principle`, `access-control-models`

### `risk-threat-landscape` → `risk-quantification`

#### `risk-threat-vulnerability-impact` — Risk, Threat, Vulnerability & Impact
- **type:** concept
- **summary:** The core vocabulary used to reason about security risk. A threat is a potential danger; a vulnerability is a weakness that could be exploited; impact is the consequence if it is; risk is the combination of how likely that is and how bad it would be.
- **core_idea:** Risk isn't just "something bad could happen" — it's likelihood times consequence, and you manage it by shrinking either side.
- **bullets:**
  - Threat: a potential cause of an unwanted incident (actor, event, or condition)
  - Vulnerability: a weakness a threat could exploit
  - Risk ≈ Likelihood × Impact (sometimes taught as Threat × Vulnerability × Impact — exact formulations vary by framework)
  - Asset: whatever has value and needs protecting — risk is always risk *to* an asset
  - Reducing risk means reducing likelihood (patch vulnerabilities), reducing impact (segmentation, backups), or both
- **related:** `security-core-vocabulary`, `threat-actor-sophistication`, `risk-register-basics`

#### `security-core-vocabulary` — Core Security Vocabulary
- **type:** concept
- **summary:** Foundational terms used across both offensive and defensive security that don't fit neatly under risk math alone — the shared language for describing how attacks actually happen.
- **core_idea:** Before "attack" or "defense" makes sense, you need the shared nouns and verbs everyone in the field uses to describe them.
- **bullets:**
  - Exploit: code or technique that takes advantage of a vulnerability
  - Payload: the part of an exploit that performs the actual malicious action
  - Attack vector: the path or means by which an attacker gains access
  - IOC (Indicator of Compromise): forensic evidence a breach may have occurred
  - TTPs (Tactics, Techniques, Procedures): the "how" an adversary operates, as cataloged by frameworks like MITRE ATT&CK
- **related:** `risk-threat-vulnerability-impact`, `attack-surface-access-vectors`

### `risk-threat-landscape` → `threat-actors-and-motivation`

#### `threat-actor-sophistication` — Threat Actor Sophistication
- **type:** concept
- **summary:** Threat actors range widely in skill, funding, and motivation — understanding where an adversary sits on that spectrum shapes what defenses are actually proportionate.
- **core_idea:** The same vulnerability means something very different depending on whether a script kiddie or a nation-state is looking at it.
- **bullets:**
  - Script kiddies: low skill, use pre-built tools, often opportunistic
  - Hacktivists: ideologically motivated, moderate skill, disruption/publicity-focused
  - Organized crime: financially motivated, well-resourced, targets data/ransom
  - Insider threats: already have legitimate access — the "sophistication" is trust, not always technical skill
  - APTs / nation-states: highest resourcing, patient, stealthy, often custom tooling
- **related:** `attack-surface-access-vectors`, `adversary-target-system-categories`, `adversarial-thinking-threat-actors`

#### `attack-surface-access-vectors` — Attack Surface & Access Vectors
- **type:** concept
- **summary:** The attack surface is every point where an unauthorized user could try to enter a system or extract data. Access vectors are the specific paths used to do so — reducing either is a core defensive goal.
- **core_idea:** You can't protect a door you don't know exists — mapping the attack surface comes before defending it.
- **bullets:**
  - Common vectors: network services, web applications, email/social engineering, physical access, removable media, supply chain, wireless
  - Attack surface grows with every exposed service, open port, and third-party integration
  - "Reducing attack surface" is a concrete, measurable defensive strategy (disable unused services, close unneeded ports)
  - Distinct from "vulnerability" — a large attack surface can exist even with zero known vulnerabilities yet
- **related:** `threat-actor-sophistication`, `footprinting-reconnaissance-techniques`

#### `adversary-target-system-categories` — Adversary Target System Categories
- **type:** concept
- **summary:** Adversaries don't just target "computers" — the category of system (traditional IT, operational technology, IoT, cloud, mobile) changes both the attacker's goals and the defender's playbook.
- **core_idea:** "It's a computer" isn't specific enough — an ICS controller, a phone, and a cloud API have almost nothing in common as targets.
- **bullets:**
  - IT systems: traditional data-focused targets — theft, ransomware, espionage
  - OT/ICS (industrial control systems): safety-critical, targeted for disruption or physical consequence, not just data
  - IoT: often weakly secured by default, frequently recruited into botnets
  - Cloud: identity- and misconfiguration-driven risk rather than classic network perimeter risk
  - Mobile: personal-data and credential-focused; app-store and permission-model risks
- **related:** `threat-actor-sophistication`, `safety-critical-hazard-case-studies`

### `security-controls-governance` → `control-types-and-access-principles`

#### `security-control-types` — Security Control Types
- **type:** concept
- **summary:** Controls are classified two ways: by what they do (preventive, detective, corrective, deterrent, compensating, directive) and by their nature (technical, administrative, physical). Knowing both dimensions helps identify gaps in a security program.
- **core_idea:** A mature control set answers both "what kind of action does this take?" and "what kind of thing is doing it?" — miss either axis and you have a blind spot.
- **bullets:**
  - Preventive: stops an incident before it happens (firewalls, MFA)
  - Detective: identifies an incident in progress or after the fact (IDS, logging)
  - Corrective: limits damage after detection (patching, restoring from backup)
  - Deterrent: discourages an attempt (warning banners, visible cameras)
  - Compensating: an alternative control used when the primary one isn't feasible
  - Categories cut across types: technical (firewalls), administrative (policies), physical (locks, badges)
- **related:** `least-privilege-principle`, `cia-triad`, `access-control-models`

#### `least-privilege-principle` — Principle of Least Privilege
- **type:** concept
- **summary:** Users, processes, and systems should be granted only the minimum access necessary to perform their function — nothing more. It's one of the highest-leverage, lowest-cost security principles to apply.
- **core_idea:** Every permission granted "just in case" is attack surface waiting for someone to compromise the account holding it.
- **bullets:**
  - Reduces blast radius if an account or process is compromised
  - Related concepts: need-to-know, separation of duties, just-in-time access
  - "Privilege creep" — access accumulated over time and never revoked — is the principle's natural enemy
  - Applies to humans, service accounts, and application processes alike (don't run web servers as root)
  - A prerequisite for zero trust — you can't verify-and-limit what you never scoped down in the first place
- **related:** `security-control-types`, `zero-trust-model`, `privileged-access-management`, `just-in-time-access`

---

## 2. Networks

### `network-architecture-fundamentals` → `osi-and-physical-layer` → `layer-models-and-physical`

#### `osi-model-layers` — OSI Model Layers
- **type:** concept
- **summary:** The seven-layer reference model for network communication: Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer encapsulates the one above it and only talks to its peer layer on the other end.
- **core_idea:** Every layer's job is to hide the messy details of the layer below it from the layer above.
- **bullets:**
  - Classic mnemonic: "Please Do Not Throw Sausage Pizza Away" (Physical → Application)
  - Compare to the simpler 4-layer TCP/IP model (Link, Internet, Transport, Application), which is what's actually implemented
  - Encapsulation: data gets a new header added at each layer going down, stripped going back up
  - Troubleshooting shortcut: "which layer is this problem actually at?" narrows the fix fast
- **related:** `ethernet-frame-structure`, `tcp-segment-header`, `ip-subnetting`

#### `physical-layer-line-coding` — Physical Layer & Line Coding
- **type:** concept
- **summary:** The physical layer turns bits into actual signals — electrical voltage, light pulses, or radio waves. Line coding schemes define exactly how a 1 or 0 gets represented as a signal transition.
- **core_idea:** Somewhere, a "1" has to become a voltage, a light, or a radio wave — line coding is the translation rulebook.
- **bullets:**
  - Common schemes: NRZ (Non-Return-to-Zero), Manchester encoding
  - Manchester encodes a clock transition into every bit, simplifying synchronization at the cost of bandwidth
  - Core concerns: bit synchronization, clock recovery, noise/interference immunity
  - Media types: copper (twisted pair, coax), fiber optic, wireless/RF
- **related:** `osi-model-layers`, `ethernet-frame-structure`

#### `ethernet-frame-structure` — Ethernet Frame Structure
- **type:** concept
- **summary:** The container format Ethernet uses to move data at Layer 2: a preamble for synchronization, source/destination MAC addresses, an EtherType or length field, the payload, and a trailing checksum.
- **core_idea:** Before an IP packet means anything, it's riding inside an Ethernet frame addressed by MAC, not IP.
- **bullets:**
  - Fields in order: Preamble, Destination MAC, Source MAC, EtherType/Length, Payload, FCS (Frame Check Sequence)
  - MAC addresses are 48 bits, burned into hardware (though software-spoofable)
  - Standard frame size range: 64–1518 bytes; "jumbo frames" extend this for performance
  - FCS is a CRC — catches corrupted frames, doesn't fix them
- **related:** `osi-model-layers`, `medium-access-control-csma`, `mac-flooding-cam-table`

#### `medium-access-control-csma` — Medium Access Control (CSMA)
- **type:** concept
- **summary:** Rules for deciding who gets to transmit on a shared medium without everyone talking at once. CSMA/CD listens for collisions on wired Ethernet; CSMA/CA avoids them proactively, which matters more on wireless.
- **core_idea:** Wired networks can detect a collision after it happens; wireless networks have to avoid causing one in the first place.
- **bullets:**
  - CSMA/CD (Collision Detection): classic wired Ethernet — listen while transmitting, back off on collision
  - CSMA/CA (Collision Avoidance): used in 802.11 Wi-Fi, since a transmitting radio can't reliably "hear" a collision over its own signal
  - Modern switched Ethernet mostly eliminated collision domains, making CSMA/CD largely historical
  - CSMA/CA relies on techniques like RTS/CTS and random backoff timers
- **related:** `ethernet-frame-structure`, `wireless-evil-twin-rogue-ap`

#### `error-detection-crc-arq` — Error Detection: CRC & ARQ
- **type:** concept
- **summary:** CRC (Cyclic Redundancy Check) mathematically detects whether a frame was corrupted in transit. ARQ (Automatic Repeat reQuest) is the retransmission strategy for what happens next when an error is found.
- **core_idea:** CRC catches the error; ARQ is what actually fixes it, by asking for the data again.
- **bullets:**
  - CRC: a checksum computed over the frame and appended to it, recomputed and compared on arrival
  - CRC detects corruption — it doesn't correct it or identify what changed
  - ARQ strategies: Stop-and-Wait (simplest, slowest), Go-Back-N, Selective Repeat (most efficient, most complex)
  - This pairing (detect via CRC, recover via ARQ) shows up at multiple layers, not just one
- **related:** `tcp-rto-estimation`

### `network-architecture-fundamentals` → `ip-addressing-and-routing` → `subnetting-and-forwarding`

#### `ip-subnetting` — IP Subnetting
- **type:** concept
- **summary:** Dividing a larger IP network into smaller sub-networks using a subnet mask or CIDR notation, so addresses can be allocated efficiently and broadcast domains kept small.
- **core_idea:** A subnet mask is just a way of drawing a line between "which part of this address is the network" and "which part is the host."
- **bullets:**
  - CIDR notation: `/24` = `255.255.255.0` = 256 addresses (254 usable)
  - Smaller subnets = smaller broadcast domains = less noise, tighter routing
  - Every subnet reserves a network address and a broadcast address (not host-assignable)
  - VLSM (Variable Length Subnet Masking) lets different subnets in the same network use different sizes
- **related:** `osi-model-layers`, `nat-network-address-translation`, `routing-protocols-overview`

#### `routing-protocols-overview` — Routing Protocols Overview
- **type:** concept
- **summary:** The protocols routers use to learn paths to networks they aren't directly connected to. Interior protocols run within one organization's network; exterior protocols connect separate autonomous systems, like the entire internet does.
- **core_idea:** A router only knows what its routing protocol has told it — no protocol, no path.
- **bullets:**
  - Interior Gateway Protocols (IGP): distance-vector (RIP) and link-state (OSPF) are the two main families
  - Distance-vector: routers share their whole routing table with neighbors periodically
  - Link-state: routers share topology info and independently calculate best paths (faster convergence, more overhead)
  - Exterior Gateway Protocol: BGP — the protocol that actually routes between autonomous systems on the internet
- **related:** `distance-vector-loops-split-horizon`, `ip-subnetting`

#### `distance-vector-loops-split-horizon` — Distance-Vector Loops & Split Horizon
- **type:** concept
- **summary:** Distance-vector routing (like RIP) can form routing loops when information goes stale faster than it propagates. Split horizon and related techniques exist specifically to prevent that.
- **core_idea:** Don't tell your neighbor about a route you only know because *they* told you about it.
- **bullets:**
  - Loops form when a router still advertises a route to a network that's actually gone down
  - Split horizon: never advertise a route back out the same interface it was learned on
  - Route poisoning: advertise a failed route with an "infinite" metric instead of just removing it silently
  - Hold-down timers: refuse to accept new info about a route for a period after it's marked down, to let stale info die out
- **related:** `routing-protocols-overview`

#### `nat-network-address-translation` — NAT (Network Address Translation)
- **type:** concept
- **summary:** Translates private IP addresses used inside a network into a public address (and back) so multiple internal hosts can share limited public IPv4 addresses.
- **core_idea:** NAT conserves address space and hides internal structure — it is not, by itself, a firewall or a real security boundary.
- **bullets:**
  - Static NAT: fixed one-to-one mapping
  - Dynamic NAT: pool of public addresses assigned as needed
  - PAT / NAT overload: many internal hosts share one public IP, distinguished by port number — the common home-router case
  - Security note: NAT provides *obscurity*, not authentication or filtering — it's often confused with a firewall
- **related:** `ip-subnetting`, `firewall-fundamentals`

### `network-architecture-fundamentals` → `transport-layer-tcp` → `tcp-mechanics`

#### `tcp-segment-header` — TCP Segment Header
- **type:** concept
- **summary:** The structured header every TCP segment carries: source/destination ports, sequence and acknowledgment numbers, control flags, window size, and a checksum — everything needed to track a reliable, ordered byte stream.
- **core_idea:** TCP's reliability isn't magic — it's a sequence number and an ack number, tracked relentlessly.
- **bullets:**
  - Minimum header size: 20 bytes
  - Control flags: SYN, ACK, FIN, RST, PSH, URG — each triggers different connection behavior
  - Sequence number: byte position of this segment's data in the overall stream
  - Window size: how much unacknowledged data the sender is allowed to have in flight (flow control)
- **related:** `tcp-connection-lifecycle`, `osi-model-layers`

#### `tcp-connection-lifecycle` — TCP Connection Lifecycle
- **type:** concept
- **summary:** How a TCP connection is opened, used, and closed: a three-way handshake to start, sequenced data transfer in the middle, and a graceful (or abrupt) teardown at the end.
- **core_idea:** TCP's handshake exists so both sides agree on starting sequence numbers before a single byte of real data moves.
- **bullets:**
  - Opening: SYN → SYN-ACK → ACK (three-way handshake)
  - Each side picks its own initial sequence number during the handshake
  - Graceful close: FIN/ACK exchanged in both directions (effectively a "four-way" teardown)
  - Abrupt close: RST — used for errors, refused connections, or aborting mid-stream
- **related:** `tcp-segment-header`, `socket-programming-basics`

#### `tcp-rto-estimation` — TCP RTO (Retransmission Timeout) Estimation
- **type:** concept
- **summary:** How long TCP waits for an acknowledgment before deciding a segment was lost and retransmitting it. Set too short, and TCP retransmits unnecessarily; too long, and it's slow to recover from real loss.
- **core_idea:** TCP is constantly estimating "how long is too long to wait" — and adjusting that estimate as the network changes.
- **bullets:**
  - Based on measured round-trip time (RTT), smoothed over multiple samples (Jacobson's algorithm)
  - RTO adapts as network conditions change — a fixed timeout would fail on both very fast and very slow paths
  - Karn's algorithm: don't use RTT samples from retransmitted segments, since it's ambiguous which transmission was actually acked
  - Directly feeds into how aggressively congestion control reacts to perceived loss
- **related:** `tcp-congestion-control`, `tcp-connection-lifecycle`

#### `tcp-congestion-control` — TCP Congestion Control (Fundamentals)
- **type:** concept
- **summary:** The mechanism TCP uses to avoid overwhelming the network: it starts sending cautiously, ramps up, and backs off sharply when it detects loss — all without any central coordinator telling it the network's actual capacity.
- **core_idea:** TCP treats packet loss as its only signal that the network is congested, and reacts by slamming the brakes.
- **bullets:**
  - Congestion window (cwnd): how much unacknowledged data is allowed in flight, separate from the receiver's advertised window
  - Slow start: cwnd grows exponentially until a threshold (ssthresh) is hit
  - Congestion avoidance: growth becomes linear (roughly +1 per RTT) — the "additive increase" half of AIMD
  - On detected loss: cwnd drops sharply — the "multiplicative decrease" half
- **related:** `tcp-congestion-variants`, `tcp-rto-estimation`

#### `tcp-congestion-variants` — TCP Congestion Control Variants
- **type:** concept
- **summary:** Different concrete algorithms implementing congestion control, each making different tradeoffs about how aggressively to grow the sending rate and what counts as a congestion signal.
- **core_idea:** "TCP congestion control" isn't one algorithm — which variant a system runs changes its real-world throughput a lot.
- **bullets:**
  - Tahoe / Reno / NewReno: the classic loss-based lineage, differing mainly in fast-recovery behavior after loss
  - CUBIC: the Linux default for years — window growth is a cubic function of time since the last loss, tuned for high-bandwidth long-distance links
  - BBR (Bottleneck Bandwidth and RTT): Google's model-based approach — estimates actual path bandwidth and RTT instead of relying only on loss as a signal
  - Choice of variant matters most on high-bandwidth, high-latency paths, where loss-based algorithms tend to under-utilize the link
- **related:** `tcp-congestion-control`

#### `socket-programming-basics` — Socket Programming Basics
- **type:** concept
- **summary:** The programming interface applications use to send and receive data over a network — a socket is an endpoint identified by an IP address and port number.
- **core_idea:** Everything a network application does eventually reduces to a handful of socket calls — open, connect or listen, send, receive, close.
- **bullets:**
  - Typical server flow: `socket()` → `bind()` → `listen()` → `accept()`
  - Typical client flow: `socket()` → `connect()`
  - `SOCK_STREAM` (TCP) vs `SOCK_DGRAM` (UDP) — reliable ordered stream vs. connectionless datagrams
  - Underlies essentially every network service and every network-facing exploit
- **related:** `tcp-connection-lifecycle`, `tcp-segment-header`

### `network-services-applications` → `naming-and-directory-services`

#### `dns-resolution-fundamentals` — DNS Resolution Fundamentals
- **type:** concept
- **summary:** The system that translates human-readable domain names into IP addresses, structured as a distributed hierarchy: root servers, then top-level domain servers, then the domain's own authoritative servers.
- **core_idea:** DNS is a hierarchy of "ask someone else" — no single server knows every answer, but every server knows who to ask next.
- **bullets:**
  - Resolution path: recursive resolver → root → TLD server → authoritative nameserver
  - Common record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (nameserver), TXT (arbitrary text, used by SPF/DKIM/verification)
  - Caching (via TTL) at every step is what makes DNS fast enough to be invisible in daily use
  - Recursive vs. authoritative servers play very different roles and have different security postures
- **related:** `dns-zone-transfer`, `dns-cache-poisoning-basics`, `dhcp-protocol`

#### `dns-zone-transfer` — DNS Zone Transfer
- **type:** concept
- **summary:** The mechanism for replicating an entire DNS zone from a primary nameserver to a secondary one — AXFR for a full transfer, IXFR for incremental updates.
- **core_idea:** A zone transfer is meant for two trusted nameservers only — if it answers anyone who asks, it just handed out your entire DNS map.
- **bullets:**
  - AXFR: full zone transfer; IXFR: incremental (only what's changed since a given serial number)
  - Legitimately used to keep secondary/backup nameservers in sync with the primary
  - Misconfigured zone transfers (allowing AXFR from any IP) are a classic reconnaissance win — every subdomain and internal host name, handed over at once
  - Mitigation: restrict zone transfers to known secondary server IPs only
- **related:** `dns-resolution-fundamentals`, `footprinting-reconnaissance-techniques`

#### `dhcp-protocol` — DHCP Protocol
- **type:** concept
- **summary:** Dynamically assigns IP addresses and network configuration to clients joining a network, so devices don't need to be manually configured.
- **core_idea:** DHCP's DORA handshake is why a laptop "just works" on a new network without anyone typing in an IP address.
- **bullets:**
  - DORA process: Discover → Offer → Request → Acknowledge
  - Hands out more than just an IP: subnet mask, default gateway, DNS servers, and a lease duration
  - Leases expire and must be renewed — clients typically try to renew well before expiry
  - Rogue DHCP servers are a real attack vector — whoever answers first can hand out a malicious gateway/DNS
- **related:** `dns-resolution-fundamentals`, `ip-subnetting`

### `network-services-applications` → `application-and-email-protocols`

#### `email-security-dmarc-spf-dkim` — Email Security: DMARC, SPF & DKIM
- **type:** concept
- **summary:** Three complementary DNS-based standards that let a domain assert who's allowed to send email on its behalf, cryptographically sign messages, and tell receivers what to do when those checks fail.
- **core_idea:** SPF says who's allowed to send, DKIM proves the message wasn't altered, and DMARC decides what happens when either one lies.
- **bullets:**
  - SPF (Sender Policy Framework): a DNS TXT record listing which mail servers are authorized to send for a domain
  - DKIM (DomainKeys Identified Mail): a cryptographic signature added to message headers, verified against a public key published in DNS
  - DMARC (Domain-based Message Authentication, Reporting & Conformance): the policy layer — tells receivers to quarantine, reject, or allow mail that fails SPF/DKIM, plus sends reporting
  - None of the three alone stops spoofing reliably; they're designed to work together
- **related:** `dns-resolution-fundamentals`, `business-email-compromise-deep-dive`

### `network-perimeter-segmentation` → `firewalls-and-filtering`

#### `firewall-fundamentals` — Firewall Fundamentals
- **type:** concept
- **summary:** Devices or software that enforce traffic policy at a network boundary, ranging from simple packet filtering to deep application-layer inspection.
- **core_idea:** A firewall is only as good as its default rule — "default deny" is the difference between a security control and a suggestion.
- **bullets:**
  - Packet filtering (stateless): decides per-packet, based on IP/port/protocol, no memory of prior packets
  - Stateful inspection: tracks connection state, so return traffic for an allowed outbound connection is permitted automatically
  - Application-layer / proxy firewalls: inspect actual application data, not just headers
  - NGFW (Next-Gen Firewall): adds intrusion prevention, deep packet inspection, and application awareness on top
- **related:** `iptables-stateful-filtering`, `defense-in-depth`, `access-control-models`

#### `iptables-stateful-filtering` — iptables & Stateful Filtering
- **type:** tool
- **summary:** The traditional Linux kernel firewall utility (built on the netfilter framework), configured via chains of rules that packets are checked against in order.
- **core_idea:** iptables rules are just an ordered list — the first matching rule wins, so rule order matters as much as the rules themselves.
- **bullets:**
  - Default chains: INPUT (traffic to this host), OUTPUT (traffic from this host), FORWARD (traffic passing through, e.g. on a router)
  - Stateful filtering via the `conntrack` module: tracks connection states NEW, ESTABLISHED, RELATED
  - Letting ESTABLISHED/RELATED traffic through automatically avoids having to write a return-traffic rule for every service
  - Largely superseded by `nftables` in newer distributions, though iptables syntax is still widely taught and used
- **related:** `firewall-fundamentals`

### `network-perimeter-segmentation` → `segmentation-and-access-control`

#### `vlan-hopping` — VLAN Hopping
- **type:** concept
- **summary:** An attack that lets traffic reach a VLAN the attacker isn't authorized to access, exploiting how switches negotiate trunking or handle nested VLAN tags.
- **core_idea:** VLANs are a logical, not physical, boundary — and switch misconfiguration is what turns that logical wall into no wall at all.
- **bullets:**
  - Switch spoofing: attacker's host pretends to be a trunking switch (via DTP) to gain access to all VLANs on the trunk
  - Double tagging: nesting two 802.1Q VLAN tags so the first switch strips the outer tag and forwards into a VLAN the attacker shouldn't reach
  - Double tagging only works one-direction and typically requires being on the native VLAN
  - Mitigation: disable auto-trunking (DTP), explicitly configure access ports, don't use VLAN 1 as the native VLAN
- **related:** `access-control-models`, `mac-flooding-cam-table`

#### `access-control-models` — Access Control Models
- **type:** concept
- **summary:** The major frameworks for deciding who can access what: owner discretion, system-enforced labels, role membership, or a combination of attributes evaluated at request time.
- **core_idea:** Every access control system is answering the same question differently: "who decides, and based on what?"
- **bullets:**
  - DAC (Discretionary Access Control): the resource owner decides who gets access — flexible, but inconsistent at scale
  - MAC (Mandatory Access Control): system-enforced labels/clearances, owner can't override (e.g. SELinux, government classification levels)
  - RBAC (Role-Based Access Control): access tied to job role, not individual identity — the most common enterprise model
  - ABAC (Attribute-Based Access Control): access decided from a combination of attributes (user, resource, environment, time) — most flexible, most complex to audit
- **related:** `least-privilege-principle`, `security-control-types`, `vlan-hopping`

### `network-reconnaissance-attacks` → `reconnaissance-and-footprinting`

#### `footprinting-reconnaissance-techniques` — Footprinting & Reconnaissance Techniques
- **type:** concept
- **summary:** The information-gathering phase before any attack attempt — building a map of a target's exposed footprint using both passive (undetectable) and active (detectable) methods.
- **core_idea:** Nearly every successful attack starts with recon that was thorough enough to make the actual exploitation step almost anticlimactic.
- **bullets:**
  - Passive: OSINT, WHOIS lookups, DNS records, job postings, social media, public code repositories — never touches the target directly
  - Active: ping sweeps, port scans, banner grabbing — touches the target, and is detectable/loggable
  - Goal is a full picture before attempting anything: exposed services, technology stack, employee names, network ranges
  - The passive/active line matters operationally — passive recon carries far less risk of detection or legal exposure
- **related:** `attack-surface-access-vectors`, `osint-passive-recon-toolkit`, `adversarial-thinking-threat-actors`

#### `adversarial-thinking-threat-actors` — Adversarial Thinking & Threat Actors (Recon Context)
- **type:** concept
- **summary:** Applying a threat actor's mindset specifically to reconnaissance — what an attacker would look for first, and in what order, to make the rest of an intrusion easier.
- **core_idea:** Recon is stage one of the cyber kill chain for a reason — everything downstream is built on what gets found here.
- **bullets:**
  - Maps to Reconnaissance, the first stage of the Lockheed Martin Cyber Kill Chain
  - Attackers prioritize recon targets by expected payoff: exposed admin panels, outdated software versions, employee credentials
  - The same threat-actor-sophistication spectrum (Fundamentals domain) shapes how much recon effort gets invested before acting
  - *Note: this leaf overlaps conceptually with the general threat-actor material in Fundamentals — kept here per the structure plan's placement, flagged there for review if you'd rather consolidate.*
- **related:** `threat-actor-sophistication`, `footprinting-reconnaissance-techniques`

### `network-reconnaissance-attacks` → `layer2-layer3-attacks`

#### `arp-spoofing-mitm` — ARP Spoofing (MITM)
- **type:** concept
- **summary:** An attack where forged ARP replies associate the attacker's MAC address with another host's IP — often the default gateway — routing that victim's traffic through the attacker.
- **core_idea:** ARP has no authentication built in, so the "last reply wins," which is exactly the door this attack walks through.
- **bullets:**
  - ARP resolves IP addresses to MAC addresses on a local network segment, with no built-in verification of replies
  - Attacker sends unsolicited (gratuitous) ARP replies claiming to own the gateway's IP
  - Enables man-in-the-middle: victim traffic flows through the attacker before reaching its real destination
  - Mitigation: Dynamic ARP Inspection (on managed switches), static ARP entries for critical hosts, port security
- **related:** `arp-poisoning-mitm`, `mac-flooding-cam-table`, `dns-cache-poisoning-basics`

#### `arp-poisoning-mitm` — ARP Poisoning (MITM)
- **type:** concept
- **summary:** The same underlying technique as ARP spoofing — forged ARP replies used to redirect traffic through an attacker. "Spoofing" and "poisoning" are used interchangeably for this attack across most of the field, describing the forged-reply mechanism and its effect on the ARP cache respectively.
- **core_idea:** This is one attack with two names, not two attacks — "poisoning" describes what happens to the ARP cache, "spoofing" describes the forged packets that cause it.
- **bullets:**
  - Mechanically identical to what's described under `arp-spoofing-mitm` — see that entry for the full technique and mitigations
  - "Poisoning" emphasizes the effect: the victim's ARP cache now holds a false entry
  - "Spoofing" emphasizes the cause: forged packets claiming a false identity
  - *Flagged in the structure review as a likely duplicate pair — worth merging into a single node once you confirm there isn't separate content intended for each.*
- **related:** `arp-spoofing-mitm`

#### `mac-flooding-cam-table` — MAC Flooding / CAM Table Overflow
- **type:** concept
- **summary:** An attack that floods a switch with frames carrying fake source MAC addresses, overflowing its CAM (Content Addressable Memory) table so the switch can no longer map MACs to ports correctly.
- **core_idea:** Overflow a switch's memory of "who's on which port," and some switches respond by acting like a hub — broadcasting everything to every port.
- **bullets:**
  - CAM table maps MAC addresses to physical switch ports, with finite capacity
  - Once full, some switches fail open, flooding all traffic to all ports — turning a switch into an eavesdropping opportunity
  - A form of Layer 2 denial-of-service as well as a sniffing enabler
  - Mitigation: port security — limit the number of MAC addresses learned per port
- **related:** `arp-spoofing-mitm`, `vlan-hopping`

#### `dns-cache-poisoning-basics` — DNS Cache Poisoning Basics
- **type:** concept
- **summary:** Injecting forged DNS records into a resolver's cache so that legitimate-looking queries return an attacker-controlled address instead of the real one.
- **core_idea:** If an attacker can guess (or brute-force) the right transaction ID and source port before the real answer arrives, the resolver caches the lie instead of the truth.
- **bullets:**
  - Classic example: the Kaminsky attack (2008), which exploited predictable transaction IDs and source ports
  - Once poisoned, every client that queries that resolver gets redirected until the cache entry expires or is flushed
  - Mitigation: DNSSEC (cryptographically signs DNS responses), randomized query IDs and source ports, response rate limiting
  - Distinct from DNS spoofing on a local network segment, though the end effect (redirection) looks similar to a victim
- **related:** `dns-resolution-fundamentals`, `arp-spoofing-mitm`

### `network-analysis-troubleshooting` → `packet-capture-analysis`

#### `wireshark-hex-header-fields` — Wireshark: Hex & Header Fields
- **type:** tool
- **summary:** Reading the raw hex/ASCII bytes of a captured packet and mapping them manually to protocol header fields, rather than relying solely on Wireshark's automatic dissector.
- **core_idea:** Wireshark's dissector is a convenience, not a crutch — knowing the byte offsets yourself is what lets you verify (or debug) what it's telling you.
- **bullets:**
  - Every protocol header has fixed or well-defined byte offsets (e.g. Ethernet's destination MAC starts at byte 0)
  - Reading hex directly matters when a dissector misparses malformed or unusual traffic
  - Builds the same mental model needed for manual packet crafting or exploit development
  - The hex pane and the parsed-fields pane in Wireshark should always agree — if they don't, something is genuinely unusual
- **related:** `wireshark-display-filters`, `tcp-segment-header`

#### `wireshark-display-filters` — Wireshark Display Filters
- **type:** tool
- **summary:** The query syntax used to narrow down which already-captured packets are shown, distinct from capture filters (which decide what gets captured in the first place).
- **core_idea:** Capture everything, filter later — display filters let you ask precise questions of a capture without having known the question in advance.
- **bullets:**
  - Example syntax: `ip.addr==10.0.0.5`, `tcp.port==443`, `http.request`, `dns.flags.response==1`
  - Capture filters use BPF syntax and are applied during capture (can't be undone after); display filters apply after, non-destructively
  - Filters can be combined with `&&`, `||`, and `!`
  - A well-built display filter is often the fastest way to find one relevant packet in a capture of thousands
- **related:** `wireshark-hex-header-fields`, `tcpdump-cli-packet-analysis`

#### `icmp-diagnostics-ping-traceroute` — ICMP Diagnostics: Ping & Traceroute
- **type:** tool
- **summary:** Two of the most basic network diagnostic tools, both built on ICMP: ping tests basic reachability and latency, traceroute maps the hop-by-hop path a packet takes to a destination.
- **core_idea:** Traceroute doesn't actually trace anything directly — it cleverly abuses TTL expiration to make each router along the path reveal itself.
- **bullets:**
  - Ping: sends ICMP Echo Request (type 8), expects ICMP Echo Reply (type 0) — measures reachability and round-trip time
  - Traceroute: sends packets with increasing TTL values; each router that drops an expired packet replies with ICMP Time Exceeded (type 11), revealing itself as one hop
  - Destination Unreachable (type 3) shows up when a path or port genuinely can't be reached
  - Many networks block ICMP at the perimeter, which breaks these tools without necessarily indicating anything is wrong
- **related:** `wireshark-display-filters`

---

## 3. Systems

### `endpoint-linux-hardening` → `linux-cli-fundamentals`

#### `overthewire-bandit-cli-reference` — OverTheWire Bandit CLI Reference
- **type:** tool
- **summary:** A well-known beginner wargame that teaches core Linux command-line skills through a sequence of small challenges, each requiring the previous level's credentials to progress.
- **core_idea:** Every real Linux privilege-escalation and forensics skill starts with comfort at a bare shell prompt — Bandit is where that comfort gets built.
- **bullets:**
  - Structured as sequential levels, each teaching one CLI concept (file permissions, hidden files, cron, SUID, etc.)
  - Forces reliance on `man` pages and built-in help rather than GUI tools
  - Widely used as an onboarding exercise before CTFs or formal penetration testing training
  - Good baseline for judging your own CLI fluency against a standard, structured ladder
- **related:** `find-permission-escalation`, `grep-recursive-content-search`, `ssh-key-auth-hardening`

#### `find-permission-escalation` — `find` & Permission-Based Escalation
- **type:** tool
- **summary:** Using the `find` command to locate files with dangerous permission or ownership configurations — a core step in both legitimate system auditing and privilege-escalation attempts.
- **core_idea:** A single misconfigured SUID binary or world-writable script found by `find` can be the entire difference between a low-privilege shell and root.
- **bullets:**
  - `find / -perm -4000` locates SUID binaries (run with the owner's privileges, not the caller's)
  - `find / -writable -type f` surfaces files an unprivileged user could tamper with
  - Combined with `-user root` or `-group root`, narrows results to root-owned targets specifically
  - The same command that helps a sysadmin audit a system is exactly what an attacker runs first after gaining any shell
- **related:** `overthewire-bandit-cli-reference`, `least-privilege-principle`

#### `grep-recursive-content-search` — `grep` & Recursive Content Search
- **type:** tool
- **summary:** Using `grep` (particularly recursively, with `-r`) to search file contents for patterns — credentials left in config files, interesting strings in binaries, or specific log entries.
- **core_idea:** If a password, API key, or interesting string exists anywhere on disk in plaintext, `grep -r` is usually how it gets found — by defenders and attackers alike.
- **bullets:**
  - `grep -rn "pattern" /path` searches recursively and shows line numbers
  - Common uses: hunting for hardcoded credentials, searching logs for an IOC, filtering command output
  - Combines well with `find` (locate candidate files) piped into `grep` (search their contents)
  - Regular expressions turn `grep` from "find this exact string" into "find anything matching this pattern"
- **related:** `overthewire-bandit-cli-reference`

### `endpoint-linux-hardening` → `remote-access-hardening`

#### `ssh-key-auth-hardening` — SSH Key Authentication & Hardening
- **type:** concept
- **summary:** Using public-key cryptography instead of passwords to authenticate SSH sessions, along with the broader set of configuration changes that harden an SSH server against brute-force and credential-based attacks.
- **core_idea:** A private key that never leaves your machine is a fundamentally different security posture than a password that can be guessed, phished, or reused.
- **bullets:**
  - Key pairs: public key placed on the server (`authorized_keys`), private key stays with the user, ideally passphrase-protected
  - Hardening steps: disable password authentication, disable root login, change the default port, use fail2ban or similar for brute-force throttling
  - `ssh-keygen` generates the pair; `ssh-copy-id` simplifies deploying the public key to a server
  - Key-based auth also enables passwordless automation (deployments, backups) without storing plaintext credentials
- **related:** `find-permission-escalation`, `authentication-technologies-hardware`

### `secure-software-lifecycle` → `threat-modeling-and-analysis`

#### `stride-threat-modeling` — STRIDE Threat Modeling
- **type:** concept
- **summary:** A structured framework for identifying threats to a system by category: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.
- **core_idea:** STRIDE turns "think like an attacker" into a checklist, so threat modeling doesn't depend entirely on one person's imagination.
- **bullets:**
  - Spoofing: pretending to be something/someone you're not
  - Tampering: modifying data or code without authorization
  - Repudiation: denying you performed an action, absent sufficient logging
  - Information disclosure, Denial of service, Elevation of privilege — the remaining three categories, self-explanatory by name
  - Developed at Microsoft; typically applied per component in a data-flow diagram, not just to the system as a whole
- **related:** `fault-tree-analysis`, `input-validation-boundaries`

#### `fault-tree-analysis` — Fault Tree Analysis (FTA)
- **type:** concept
- **summary:** A top-down analysis technique that starts from an undesired top event (a failure or hazard) and works backward through Boolean logic gates to identify all the combinations of lower-level faults that could cause it.
- **core_idea:** FTA starts with "here's the disaster" and works backward to every combination of smaller failures that could cause it.
- **bullets:**
  - Uses AND/OR logic gates to combine contributing faults toward the top event
  - Originated in reliability engineering (safety-critical systems, aerospace) before being applied to security
  - Complements FMEA, which works the opposite direction (bottom-up, from component failure to system effect)
  - Useful for quantifying how many independent failures would need to occur simultaneously for a worst-case outcome
- **related:** `fmea-failure-mode-analysis`, `stpa-hazard-analysis`

#### `fmea-failure-mode-analysis` — FMEA (Failure Mode & Effects Analysis)
- **type:** concept
- **summary:** A bottom-up reliability technique that systematically walks through each component of a system, asking how it could fail and what effect that failure would have.
- **core_idea:** FMEA asks "what if this one part breaks?" for every part, one at a time, before anything actually breaks.
- **bullets:**
  - For each component: identify failure modes, effects, severity, likelihood, and detectability
  - Often scored with a Risk Priority Number (severity × occurrence × detection) to prioritize fixes
  - Bottom-up, in contrast to fault tree analysis's top-down approach — the two are often used together
  - Originated in aerospace/defense reliability engineering, now widely applied in software and security contexts too
- **related:** `fault-tree-analysis`, `stpa-hazard-analysis`

#### `stpa-hazard-analysis` — STPA (Systems-Theoretic Process Analysis)
- **type:** concept
- **summary:** A modern hazard analysis method that treats accidents as failures of control (missing or inadequate safety constraints) rather than only chains of component failures — better suited to complex, software-intensive systems.
- **core_idea:** Sometimes nothing breaks — the accident happens because the *control* of the system was wrong from the start, which older component-failure models can't catch.
- **bullets:**
  - Developed by Nancy Leveson (MIT) as part of the broader STAMP (Systems-Theoretic Accident Model and Processes) framework
  - Models the system as control loops (controller, actuator, controlled process, sensors) and looks for unsafe control actions
  - Particularly suited to software-intensive and safety-critical systems, where "no component failed" but the system still behaved unsafely
  - Complements, rather than replaces, older techniques like FTA/FMEA — useful when interactions between components matter as much as the components themselves
- **related:** `fault-tree-analysis`, `fmea-failure-mode-analysis`, `iec-61508-sil-levels`

### `secure-software-lifecycle` → `secure-coding-practices`

#### `input-validation-boundaries` — Input Validation & Trust Boundaries
- **type:** concept
- **summary:** The practice of checking and constraining any data crossing from an untrusted source into a trusted context — the single most foundational secure-coding discipline.
- **core_idea:** Almost every major class of software vulnerability is, underneath, a failure to validate input at the boundary where trust changes.
- **bullets:**
  - A trust boundary is any point where data crosses from a less-trusted source to a more-trusted context (user input, network data, file uploads)
  - Validate against an allowlist (what's permitted) rather than a denylist (what's forbidden) wherever feasible — denylists are always incomplete
  - Applies to type, length, format, and range — not just "is this dangerous," but "is this even valid"
  - Root cause behind injection attacks, buffer overflows, and many logic-based vulnerabilities alike
- **related:** `memory-safety-buffer-overruns`, `sql-injection-union`, `stride-threat-modeling`

#### `memory-safety-buffer-overruns` — Memory Safety & Buffer Overruns
- **type:** concept
- **summary:** Bugs where a program writes or reads data outside the bounds of an allocated memory buffer, historically one of the most exploited classes of vulnerability in C/C++ software.
- **core_idea:** In a memory-unsafe language, "close enough" bounds checking isn't close enough — writing one byte past a buffer can rewrite the program's own control flow.
- **bullets:**
  - Buffer overflow: writing past the end of an allocated buffer, potentially overwriting adjacent memory (including return addresses)
  - Memory-unsafe languages (C, C++) require the programmer to manage bounds manually; memory-safe languages (Rust, Java, Python) enforce it automatically
  - Mitigations: stack canaries, ASLR (Address Space Layout Randomization), DEP/NX (non-executable memory), safer string-handling functions
  - Directly connects to exploitation techniques like stack-based buffer overflows and ROP chains
- **related:** `input-validation-boundaries`, `buffer-overflow-stack-layout`, `integer-overflow-wraparound`

#### `integer-overflow-wraparound` — Integer Overflow & Wraparound
- **type:** concept
- **summary:** A bug where an arithmetic result exceeds the range a variable's type can hold, causing it to "wrap around" to an unexpected value — small enough on its own, but often the trigger for a much larger vulnerability.
- **core_idea:** An 8-bit counter at 255 doesn't stop — it wraps to 0, and that quiet wraparound is exactly what turns a size check into a bypassed size check.
- **bullets:**
  - Unsigned integers wrap silently (255 + 1 = 0 for an 8-bit unsigned type); signed overflow is undefined behavior in languages like C
  - A classic exploitation pattern: an oversized value wraps to a small (or negative) one, bypassing a length check and enabling a buffer overflow downstream
  - Compilers can optimize away overflow checks that rely on undefined signed-overflow behavior, silently removing the protection a developer thought they had
  - Mitigation: use checked arithmetic, wider integer types where appropriate, and explicit bounds validation instead of relying on overflow behavior
- **related:** `memory-safety-buffer-overruns`, `race-conditions-toctou`

#### `race-conditions-toctou` — Race Conditions & TOCTOU
- **type:** concept
- **summary:** Bugs arising from the timing gap between checking a condition and acting on it — Time-Of-Check to Time-Of-Use — during which the underlying state can change out from under the program.
- **core_idea:** Checking that something is safe and then acting on it are two separate moments — and anything can happen in the gap between them.
- **bullets:**
  - Classic example: checking a file's permissions, then opening it — an attacker swaps the file (e.g. via a symlink) in between
  - Not unique to files — applies to any shared resource accessed by multiple threads/processes without proper synchronization
  - Mitigation: atomic operations that combine check-and-use into a single step, proper locking, avoiding symlink-following on privileged operations
  - A recurring source of privilege-escalation bugs precisely because the vulnerability window can be vanishingly small but still exploitable
- **related:** `integer-overflow-wraparound`, `fail-secure-error-handling`

#### `fail-secure-error-handling` — Fail-Secure Error Handling
- **type:** concept
- **summary:** Designing systems so that when something goes wrong — an exception, a crash, an unexpected input — the resulting state defaults to secure/closed rather than open/permissive.
- **core_idea:** When something breaks, the safe failure mode is "deny by default," not "well, let's just let it through."
- **bullets:**
  - Fail-secure (or fail-closed): on error, access is denied — the standard for security-critical logic
  - Fail-open: on error, access is allowed — sometimes intentional for availability-critical systems (e.g. a fire door defaulting to unlocked), but dangerous for authentication/authorization logic
  - Common bug pattern: an exception in an authorization check is silently swallowed, and the code proceeds as if access were granted
  - Explicit default-deny logic, combined with proper exception handling, is what prevents "unhandled error" from silently becoming "access granted"
- **related:** `race-conditions-toctou`, `security-code-review-checklist`

#### `security-code-review-checklist` — Security Code Review Checklist
- **type:** concept
- **summary:** A structured set of things to specifically look for when reviewing code for security issues, distinct from a general code-quality or style review.
- **core_idea:** A security code review isn't "does this work" — it's "what happens when this is given input it wasn't designed for."
- **bullets:**
  - Look specifically for: unvalidated input, hardcoded secrets, improper error handling, missing authorization checks, unsafe deserialization
  - Check every trust boundary crossing, not just the "interesting-looking" functions
  - Automated static analysis (SAST) catches known patterns; manual review catches logic flaws automated tools miss
  - Should be a distinct pass from a functional/style code review, using a different mental checklist entirely
- **related:** `fail-secure-error-handling`, `sast-dast-overview`, `input-validation-boundaries`

### `secure-software-lifecycle` → `supply-chain-and-composition`

#### `sbom-supply-chain` — SBOM & Software Supply Chain
- **type:** concept
- **summary:** A Software Bill of Materials is a formal, machine-readable inventory of every component (including transitive dependencies) that makes up a piece of software — the foundation for knowing what you're actually running.
- **core_idea:** You can't patch a vulnerable dependency you don't know you have — an SBOM is what turns "probably fine" into "definitely accounted for."
- **bullets:**
  - Lists direct and transitive dependencies, including versions and licenses
  - Common formats: SPDX, CycloneDX
  - Supply chain attacks (compromising a dependency instead of the target directly) make SBOMs a security necessity, not just a compliance checkbox
  - Increasingly required by regulation/procurement policy (e.g. US federal software supply chain requirements)
- **related:** `sca-dependency-scanning`, `container-image-scanning`

#### `sca-dependency-scanning` — SCA & Dependency Scanning
- **type:** tool
- **summary:** Software Composition Analysis tools automatically scan a project's dependencies against known-vulnerability databases, flagging outdated or vulnerable third-party components.
- **core_idea:** Almost nobody writes vulnerable code on purpose — SCA exists because most vulnerable code arrives as someone else's dependency.
- **bullets:**
  - Compares dependency versions against vulnerability databases (e.g. the National Vulnerability Database, GitHub Advisory Database)
  - Distinct from SAST/DAST — SCA looks at what you're *using*, not code you wrote yourself
  - Typically integrated into CI/CD pipelines to catch vulnerable dependencies before deployment
  - Effective SCA depends on having an accurate SBOM to check against in the first place
- **related:** `sbom-supply-chain`, `sast-dast-overview`

### `application-security-testing` → `testing-methodologies`

#### `sast-dast-overview` — SAST & DAST Overview
- **type:** concept
- **summary:** Two complementary categories of automated security testing: SAST analyzes source code without running it; DAST tests a running application from the outside, the way an attacker would.
- **core_idea:** SAST reads the recipe for mistakes; DAST tastes the finished dish for problems — neither alone tells the whole story.
- **bullets:**
  - SAST (Static Application Security Testing): analyzes source code/binaries for known-dangerous patterns, before the app ever runs
  - DAST (Dynamic Application Security Testing): sends real requests to a running application and observes the responses, no source code needed
  - SAST catches issues early (shift-left) but produces more false positives; DAST finds issues that only manifest at runtime but requires a working deployment
  - Mature programs use both, plus SCA for dependencies, as complementary layers rather than substitutes for each other
- **related:** `sca-dependency-scanning`, `security-code-review-checklist`

### `safety-critical-systems` → `standards-and-safety-levels`

#### `iec-61508-sil-levels` — IEC 61508 & SIL Levels
- **type:** concept
- **summary:** IEC 61508 is the foundational international standard for functional safety of electrical/electronic/programmable safety systems, defining Safety Integrity Levels (SIL 1–4) that quantify how reliably a system must prevent hazardous failure.
- **core_idea:** A SIL rating isn't a quality label — it's a specific, numeric target for how rarely a safety function is allowed to fail on demand.
- **bullets:**
  - SIL 1 (lowest rigor) through SIL 4 (highest, e.g. nuclear/rail signaling) — each level demands a specific maximum probability of dangerous failure
  - Covers the full safety lifecycle: hazard analysis, requirements, design, verification, and ongoing maintenance
  - Sector-specific derivatives exist: ISO 26262 (automotive), IEC 61511 (process industry), IEC 62061 (machinery)
  - Directly relevant to cyber-physical systems, where a security failure can cascade into a safety failure
- **related:** `stpa-hazard-analysis`, `safety-critical-v-and-v`

#### `safety-critical-v-and-v` — Safety-Critical Verification & Validation (V&V)
- **type:** concept
- **summary:** The rigorous process of proving a safety-critical system meets its requirements (verification — "built it right") and actually satisfies its intended real-world purpose (validation — "built the right thing").
- **core_idea:** Verification asks "does it meet the spec?"; validation asks "was the spec even the right thing to build?" — a system can pass one and still fail the other.
- **bullets:**
  - Verification: does the system meet its documented requirements (traceable, testable requirements are essential)
  - Validation: does the system actually satisfy the real-world need it was built for
  - Safety-critical V&V typically requires far more rigorous documentation and traceability than standard software QA
  - Often mandated by the specific SIL/safety standard the system is certified against
- **related:** `iec-61508-sil-levels`, `software-fault-tolerance-cots-hardware`

### `safety-critical-systems` → `hazard-analysis-case-studies`

#### `software-fault-tolerance-cots-hardware` — Software Fault Tolerance & COTS Hardware
- **type:** concept
- **summary:** Techniques for keeping a safety-critical system functioning correctly despite hardware or software faults, especially relevant when using COTS (Commercial Off-The-Shelf) components not originally designed for safety-critical use.
- **core_idea:** COTS hardware is cheaper and more available, but it wasn't built to fail safely — fault tolerance is how you get safety-critical behavior out of a component that was never certified for it.
- **bullets:**
  - Redundancy patterns: dual/triple modular redundancy, voting systems, watchdog timers
  - COTS components introduce risk because their internal failure modes and rates often aren't fully characterized by the vendor
  - Graceful degradation: designing systems to fail into a safe, reduced-function state rather than fail completely
  - A recurring tension in aerospace/defense engineering — COTS is cheaper and more available, but demands extra fault-tolerance engineering to compensate
- **related:** `safety-critical-v-and-v`, `safety-critical-hazard-case-studies`

#### `safety-critical-hazard-case-studies` — Safety-Critical Hazard Case Studies
- **type:** concept
- **summary:** Real historical incidents where a hazard analysis gap, software fault, or safety-process failure led to serious consequences — used to ground abstract safety principles in concrete, documented failure.
- **core_idea:** Every safety standard in this domain exists because a specific, documented failure showed why the previous approach wasn't enough.
- **bullets:**
  - Case studies are typically drawn from aerospace, rail, medical device, and industrial control incident reports
  - Common root causes: incomplete hazard analysis, requirements that were technically met but didn't cover the actual failure mode, inadequate V&V
  - Useful precisely because they show the gap between "we followed a process" and "the process covered this specific scenario"
  - Directly connects to `adversary-target-system-categories` (Fundamentals) — OT/ICS systems sit at the intersection of safety and security failure modes
- **related:** `software-fault-tolerance-cots-hardware`, `adversary-target-system-categories`

---

## 4. Identity

### `authentication-mechanisms` → `multi-factor-and-password-policy`

#### `mfa-mechanisms` — MFA (Multi-Factor Authentication) Mechanisms
- **type:** concept
- **summary:** Combining two or more independent proof categories — something you know, have, or are — so a single stolen credential isn't enough to authenticate as someone else.
- **core_idea:** MFA doesn't make any one factor unbreakable — it makes an attacker need to break more than one at the same time.
- **bullets:**
  - Classic factor categories: something you know (password), something you have (phone, hardware token), something you are (biometric)
  - Extended categories sometimes added: somewhere you are (location), something you do (behavioral pattern)
  - TOTP (Time-based One-Time Password, RFC 6238) underlies most authenticator apps
  - Strength varies a lot by implementation: SMS-based MFA is the weakest common form (vulnerable to SIM swapping); FIDO2/hardware keys are the strongest
- **related:** `password-attack-mitigations`, `sso-saml-oidc-basics`

#### `password-policy-vs-passwordless` — Password Policy vs. Passwordless
- **type:** concept
- **summary:** Traditional password policy (complexity rules, forced rotation) has largely fallen out of favor in current guidance in favor of length and breach-checking — and passwordless approaches are increasingly replacing passwords entirely.
- **core_idea:** Forcing frequent password changes trains people to make small, predictable tweaks — which is weaker security dressed up as a stronger policy.
- **bullets:**
  - Current NIST guidance (SP 800-63B) recommends against mandatory periodic rotation and arbitrary complexity rules, favoring length and screening against known-breached passwords instead
  - Passwordless: FIDO2/WebAuthn and passkeys tie authentication to a device-held private key instead of a shared secret
  - Removing the shared secret entirely also removes phishability of "the secret" — there's nothing to trick a user into typing into a fake site
  - Biometrics are often the passwordless "unlock" step for the underlying key, not the credential itself
- **related:** `mfa-mechanisms`, `password-attack-mitigations`

#### `password-attack-models-online-offline` — Password Attack Models: Online vs. Offline
- **type:** concept
- **summary:** Password attacks split into two very different threat models: online attacks guess against a live system (slow, loud, rate-limitable), and offline attacks crack a stolen hash with no rate limit at all.
- **core_idea:** The moment a password hash leaves the server, the attacker's only remaining constraint is compute — every defense that depends on rate-limiting stops mattering.
- **bullets:**
  - Online: guesses submitted directly to a live login prompt — constrained by lockouts, rate limits, and logging
  - Offline: attacker already has the hash (via a breach or extraction) and cracks it on their own hardware, unconstrained by the target system
  - Techniques: dictionary attacks, brute force, rainbow tables (precomputed hash lookups), hybrid attacks (dictionary + mutation rules)
  - Offline attacks are why hash *storage* strength matters as much as login-page rate limiting
- **related:** `password-attack-mitigations`, `unix-password-storage-cracking`

#### `password-attack-mitigations` — Password Attack Mitigations
- **type:** concept
- **summary:** The layered defenses that make both online guessing and offline cracking impractical: rate limiting on the front door, strong salted hashing in storage, and MFA as a backstop if a password is compromised anyway.
- **core_idea:** No single mitigation here is sufficient alone — rate limiting stops online attacks, strong hashing slows offline attacks, and MFA covers you when both fail.
- **bullets:**
  - Account lockout / rate limiting: directly mitigates online guessing
  - Slow, salted hashing algorithms (bcrypt, scrypt, Argon2): directly mitigates offline cracking by making each guess computationally expensive
  - Breach-password screening at registration/change time (e.g. checking against known-compromised password corpora)
  - MFA as a backstop: even a successfully guessed or cracked password isn't enough on its own
- **related:** `password-attack-models-online-offline`, `mfa-mechanisms`

### `authentication-mechanisms` → `kerberos-and-directory-auth`

#### `kerberos-ticket-flow-as-tgs-tgt` — Kerberos Ticket Flow (AS, TGT, TGS)
- **type:** concept
- **summary:** Kerberos authenticates users once and then lets them access multiple services without re-entering credentials, using a trusted third party and a sequence of time-limited tickets rather than repeatedly sending a password.
- **core_idea:** After the very first login, a Kerberos user is never proving their password again — they're proving they hold a ticket the KDC already vouched for.
- **bullets:**
  - AS (Authentication Server): handles the initial login, issues a TGT (Ticket Granting Ticket) if credentials check out
  - TGS (Ticket Granting Server): using the TGT, issues a service ticket for a specific resource without asking for the password again
  - The client presents that service ticket directly to the target service to gain access
  - AS and TGS together make up the KDC (Key Distribution Center); tickets are time-limited and timestamped to resist replay
- **related:** `kerberos-protocol`, `aaa-access-control-model`

### `authentication-mechanisms` → `authentication-concepts`

#### `identity-authentication-fundamentals` — Identity & Authentication Fundamentals
- **type:** concept
- **summary:** The foundational distinction between identity (a claim about who someone is), authentication (proving that claim), and authorization (what that proven identity is allowed to do) — three separate concepts routinely blurred in casual conversation.
- **core_idea:** "Logged in" only answers *who* — it says nothing yet about *what they're allowed to do*, which is a separate question entirely.
- **bullets:**
  - Identity: a claimed attribute or set of attributes (a username, an email, a certificate subject)
  - Authentication: proof that the claimed identity is genuine
  - Authorization: the permissions granted to that now-proven identity — a distinct step, often conflated with authentication in casual speech
  - Identity lifecycle spans provisioning (creating the identity), active use, and deprovisioning (removing access when it's no longer needed) — deprovisioning failures are a common real-world security gap
- **related:** `aaa-access-control-model`, `authentication-failure-insight`

#### `aaa-access-control-model` — AAA (Authentication, Authorization, Accounting)
- **type:** concept
- **summary:** A three-part model for controlling and tracking access: prove who you are, determine what you're allowed to do, and log what actually happened — classically implemented by protocols like RADIUS and TACACS+.
- **core_idea:** Authentication and authorization get most of the attention, but without accounting, there's no way to answer "what did this identity actually do" after the fact.
- **bullets:**
  - Authentication: verifying identity
  - Authorization: determining permitted actions for that verified identity
  - Accounting: logging what was actually done — the basis for audit trails and incident investigation
  - RADIUS and TACACS+ are the classic protocols implementing AAA for network device and remote access control
- **related:** `identity-authentication-fundamentals`, `least-privilege-principle`

#### `authentication-failure-insight` — Authentication Failure Insight
- **type:** concept
- **summary:** Studying how authentication actually breaks in real systems — not the theory of how it's supposed to work, but the recurring practical failure patterns that make "broken authentication" a persistently common vulnerability class.
- **core_idea:** Authentication rarely fails because the crypto was wrong — it fails because of session handling, reused credentials, and predictable recovery flows around the crypto.
- **bullets:**
  - Credential stuffing: reusing username/password pairs leaked from one breach against other, unrelated services
  - Weak session management: predictable session tokens, sessions that never expire, tokens not invalidated on logout
  - Insufficient lockout or rate limiting, allowing online guessing to actually succeed
  - Predictable or poorly-verified password reset flows are a frequent real-world bypass, independent of how strong the password itself is
- **related:** `identity-authentication-fundamentals`, `cookie-poisoning-session-hijack`

### `federation-single-sign-on` → `sso-protocols`

#### `sso-saml-oidc-basics` — SSO: SAML & OIDC Basics
- **type:** concept
- **summary:** Single Sign-On lets a user authenticate once with a trusted Identity Provider and access multiple independent services without logging in again — SAML and OIDC are the two dominant standards for making that assertion portable.
- **core_idea:** SSO doesn't eliminate authentication — it centralizes it, so every relying service can trust one Identity Provider's word instead of running its own login.
- **bullets:**
  - SAML (Security Assertion Markup Language): XML-based assertions, common in enterprise SSO, older but still widely deployed
  - OIDC (OpenID Connect): built on top of OAuth 2.0, JSON/JWT-based, dominant in modern web and mobile apps
  - Roles: Identity Provider (IdP) authenticates the user and issues the assertion; Service Provider (SP) / Relying Party trusts that assertion
  - Centralizing authentication this way also centralizes risk — a compromised IdP compromises every service that trusts it
- **related:** `identity-authentication-fundamentals`, `mfa-mechanisms`

### `privileged-access-governance` → `pam-and-jit`

#### `privileged-access-management` — Privileged Access Management (PAM)
- **type:** concept
- **summary:** The tooling and practices for managing, monitoring, and tightly controlling accounts with elevated privileges — admin accounts, service accounts, and root — which are disproportionately high-value targets.
- **core_idea:** Privileged accounts are worth more to an attacker than any single regular user account, so they need controls regular accounts don't.
- **bullets:**
  - Core practices: credential vaulting (secrets never directly known to the human user), session recording, approval workflows before elevation
  - Reduces the impact of credential theft — a vaulted, rotated credential is far less useful to an attacker than a static one
  - Gartner and other analysts treat PAM as its own distinct security tooling market category, separate from general IAM
  - Works hand-in-hand with just-in-time access — vaulting *what* privileges exist, JIT limits *when* they're active
- **related:** `just-in-time-access`, `least-privilege-principle`

#### `just-in-time-access` — Just-in-Time (JIT) Access
- **type:** concept
- **summary:** Granting elevated privileges only for the specific window they're actually needed, then automatically revoking them — instead of leaving admin rights permanently active and unused most of the time.
- **core_idea:** Standing privileges are risk that sits idle 99% of the time waiting to be misused — JIT access collapses that window down to only when it's actually needed.
- **bullets:**
  - Contrasts with "standing privileges" — always-on elevated access that exists whether or not it's currently being used
  - Typically implemented as a time-boxed approval workflow, often integrated directly with PAM tooling
  - Extends least privilege into a temporal dimension: not just "least scope," but "least *time*" as well
  - Shrinks the window during which a compromised privileged account is actually dangerous
- **related:** `privileged-access-management`, `least-privilege-principle`

---

## 5. Web Security

### `web-platform-fundamentals` → `http-server-basics`

#### `web-fundamentals-server-config` — Web Fundamentals & Server Configuration
- **type:** concept
- **summary:** The basics of how HTTP works (requests, responses, methods, status codes) and how server configuration choices — headers, TLS termination, virtual hosts — shape a web application's actual attack surface.
- **core_idea:** Most web vulnerabilities don't come from exotic attacks — they come from ordinary configuration choices nobody revisited after launch.
- **bullets:**
  - HTTP methods (GET, POST, PUT, DELETE) and status codes form the basic request/response vocabulary
  - Security headers matter as much as application code: Content-Security-Policy, X-Frame-Options, Strict-Transport-Security (HSTS)
  - TLS termination point (at the load balancer vs. the app server) changes where traffic is actually encrypted end-to-end
  - Misconfiguration — not just missing patches — is one of the most common root causes of real-world web breaches
- **related:** `web-server-attack-categories`, `web-hardening-baseline-apache-iis`

#### `web-server-attack-categories` — Web Server Attack Categories
- **type:** concept
- **summary:** A broad taxonomy for organizing web attacks by where they land — injection, broken authentication/session handling, cross-site scripting, misconfiguration, and broken access control are the recurring buckets.
- **core_idea:** Almost every specific web CVE is really just a fresh example of one of a handful of well-known attack categories.
- **bullets:**
  - Server-side categories: injection, broken access control, misconfiguration
  - Client-side categories: XSS, CSRF, clickjacking
  - Broken authentication/session management cuts across both, since it can be exploited from either side
  - This category-level view is what frameworks like the OWASP Top 10 are formalizing and ranking
- **related:** `owasp-top10-overview`, `web-fundamentals-server-config`

#### `owasp-top10-overview` — OWASP Top 10 Overview
- **type:** concept
- **summary:** OWASP's ranked list of the most critical web application security risks, most recently revised as the Top 10:2025 (finalized January 2026), replacing the long-standing 2021 edition.
- **core_idea:** The Top 10 isn't a fixed list — the categories and their rankings shift as real-world vulnerability data changes, so citing a specific letter/number is only accurate for one edition at a time.
- **bullets:**
  - A01:2025 Broken Access Control holds the #1 spot, same as in the 2021 edition
  - A02:2025 Security Misconfiguration moved up sharply, from #5 in 2021
  - A05:2025 Injection (which folds in XSS) dropped from #3 in 2021 to #5
  - New in the 2025 edition: Software Supply Chain Failures and Mishandling of Exceptional Conditions, reflecting how real-world risk has shifted toward dependencies and error-handling gaps
- **related:** `sql-injection-union`, `xss-reflected-stored`, `web-server-attack-categories`

### `web-platform-fundamentals` → `web-application-firewalls`

#### `firewall-vendor-landscape` — WAF Vendor Landscape
- **type:** concept
- **summary:** An overview of how Web Application Firewalls are deployed in practice — cloud-based, on-premises appliances, or open-source — all working by filtering HTTP traffic against rules, not by fixing the underlying code.
- **core_idea:** A WAF is a compensating control, not a fix — it can block a known-bad pattern, but it doesn't patch the vulnerability the pattern was exploiting.
- **bullets:**
  - Cloud-based WAFs (e.g. Cloudflare, AWS WAF) sit in front of traffic before it reaches the origin server
  - On-premises/appliance WAFs are deployed inline within the organization's own network
  - ModSecurity is the best-known open-source WAF engine, often paired with the OWASP Core Rule Set
  - Rule-based filtering means WAFs can be bypassed by novel payloads that don't match existing signatures — defense in depth still requires fixing the code too
- **related:** `firewall-fundamentals`, `web-hardening-baseline-apache-iis`

### `injection-and-input-attacks` → `sql-injection`

#### `sql-injection-union` — SQL Injection: UNION-Based
- **type:** concept
- **summary:** A SQL injection technique where an attacker appends a `UNION SELECT` statement to an injectable query, combining the results of their own query with the application's original query — and getting the extracted data back through the app's normal response.
- **core_idea:** UNION-based injection turns the application's own display logic into the attacker's data exfiltration channel.
- **bullets:**
  - Requires the injected `UNION SELECT` to match the original query's column count and roughly compatible data types
  - Attackers typically probe column count first (e.g. via `ORDER BY` trial and error) before constructing the working UNION payload
  - One of several SQLi variants — others include error-based (leveraging verbose error messages), boolean/blind (inferring data from true/false responses), and time-based blind (inferring data from response delays)
  - Root cause and fix are the same as any injection: untrusted input reaching a query without parameterization
- **related:** `input-validation-boundaries`, `owasp-top10-overview`

### `client-side-attacks` → `xss-and-client-execution`

#### `xss-reflected-stored` — XSS: Reflected & Stored
- **type:** concept
- **summary:** Two of the main forms of Cross-Site Scripting: reflected XSS bounces a malicious script back in an immediate response (usually via a crafted link), while stored XSS saves the script server-side to be served to every future visitor.
- **core_idea:** Reflected XSS needs a victim to click something; stored XSS just needs a victim to visit a page at all.
- **bullets:**
  - Reflected: payload rides in the request itself (e.g. a URL query parameter), reflected straight back in the response — requires social-engineering a victim into clicking a crafted link
  - Stored: payload is saved server-side (a comment, a profile field) and served automatically to anyone who later views that content
  - Stored XSS is generally considered more dangerous, since it needs no per-victim social engineering step
  - Both execute attacker script in the victim's browser under the target site's own origin, enabling cookie theft, session hijacking, and UI manipulation
- **related:** `client-side-web-attacks`, `cookie-poisoning-session-hijack`

#### `client-side-web-attacks` — Client-Side Web Attacks
- **type:** concept
- **summary:** The broader category of attacks that execute or manipulate things entirely within the victim's browser — including DOM-based XSS, clickjacking, and abuse of client-side storage — beyond the classic reflected/stored XSS split.
- **core_idea:** Not every client-side vulnerability ever touches the server at all — some live entirely in how the browser's own JavaScript handles untrusted data.
- **bullets:**
  - DOM-based XSS: the vulnerable code path is entirely client-side JavaScript reading untrusted data (like `location.hash`) and injecting it into the page — the server never sees the malicious payload
  - Clickjacking: overlaying invisible or disguised elements to trick a user into clicking something other than what they see
  - Mitigations for clickjacking: `X-Frame-Options` header, CSP's `frame-ancestors` directive
  - Client-side storage (localStorage, sessionStorage) is a common target once any script-execution foothold exists
- **related:** `xss-reflected-stored`, `cookie-poisoning-session-hijack`

### `session-and-request-forgery` → `session-hijacking-and-csrf`

#### `cookie-poisoning-session-hijack` — Cookie Poisoning & Session Hijacking
- **type:** concept
- **summary:** Session hijacking is stealing or predicting a valid session identifier to impersonate a logged-in user; cookie poisoning is tampering with cookie contents directly when they aren't properly signed or encrypted.
- **core_idea:** A session cookie is a bearer token — whoever holds it *is* the logged-in user, as far as the server can tell.
- **bullets:**
  - Session hijacking vectors: theft via XSS, network sniffing on unencrypted connections, predictable session ID generation
  - Cookie poisoning: modifying cookie values client-side when the server doesn't cryptographically verify their integrity
  - Key mitigations: `HttpOnly` (blocks script access to the cookie), `Secure` (cookie only sent over HTTPS), short session lifetimes, regenerating the session ID after login or privilege change
  - Session fixation is a related, subtly different attack: forcing a victim to use a session ID the attacker already knows, rather than stealing one
- **related:** `csrf-token-defense`, `xss-reflected-stored`, `authentication-failure-insight`

#### `csrf-token-defense` — CSRF & Token Defense
- **type:** concept
- **summary:** Cross-Site Request Forgery tricks an authenticated victim's browser into submitting an unwanted request to a site they're logged into — exploiting the fact that browsers attach cookies automatically regardless of which site initiated the request.
- **core_idea:** CSRF doesn't need to steal anything — it just needs to make the victim's own browser send a request the victim never intended.
- **bullets:**
  - Works because cookies are attached to requests by the browser automatically, based on destination domain, not request origin
  - Primary defense: anti-CSRF tokens — unpredictable, session-tied values that must accompany any state-changing request
  - `SameSite` cookie attribute (Strict/Lax) restricts when cookies are sent on cross-site requests, providing a strong complementary defense
  - Removed from the OWASP Top 10's ranked list itself since the 2017 edition (framework-level protections reduced its prevalence), but still explicitly covered in the OWASP Testing Guide
- **related:** `cookie-poisoning-session-hijack`

### `web-hardening-defense` → `server-hardening-baselines`

#### `web-hardening-baseline-apache-iis` — Web Hardening Baseline (Apache/IIS)
- **type:** concept
- **summary:** The standard checklist of configuration changes to reduce a web server's attack surface and information disclosure, applicable across the two most common server platforms (Apache and IIS) with platform-specific implementation details.
- **core_idea:** Hardening a web server is mostly subtraction — turning off everything that was enabled by default but isn't actually needed.
- **bullets:**
  - Disable directory listing, remove default/sample content and installation files
  - Suppress version banners and detailed error pages that reveal server software/version to attackers
  - Disable unused modules/features to shrink the attack surface
  - TLS hardening: strong cipher suites only, disable outdated protocol versions (SSLv3, TLS 1.0/1.1)
- **related:** `web-fundamentals-server-config`, `firewall-vendor-landscape`

---

## 6. Cloud Security

### `cloud-governance-models` → `shared-responsibility-and-benchmarks`

#### `cloud-shared-responsibility` — Cloud Shared Responsibility Model
- **type:** concept
- **summary:** Cloud security is a split responsibility: the provider secures the infrastructure "of the cloud" (physical hardware, hypervisor, network), while the customer secures what they put "in the cloud" (data, configuration, IAM, and — depending on service model — the OS itself).
- **core_idea:** "It's in the cloud" tells you nothing about whether it's secure — it just tells you which side of the responsibility line the risk sits on.
- **bullets:**
  - The split shifts by service model: IaaS leaves the customer managing the most (OS, patching); PaaS shares it more evenly; SaaS leaves the provider managing nearly everything except data and access config
  - Misunderstanding this model — assuming the provider handles something they don't — is a leading root cause of cloud breaches
  - Applies to security *and* compliance: a compliance certification on the provider's infrastructure doesn't automatically make the customer's usage compliant
  - Every cloud misconfiguration incident is, structurally, a "customer side" failure of this model
- **related:** `cis-cloud-benchmarks`, `aws-iam-least-privilege`

#### `cis-cloud-benchmarks` — CIS Cloud Benchmarks
- **type:** concept
- **summary:** The Center for Internet Security publishes detailed, checkable hardening benchmarks for major cloud platforms (AWS, Azure, GCP), turning "secure the cloud account" into a specific, auditable list of settings.
- **core_idea:** A CIS benchmark turns "harden your cloud account" from a vague goal into a checklist you can literally pass or fail line by line.
- **bullets:**
  - Recommendations are concrete and testable — e.g. "ensure MFA is enabled for the root account," not just "secure your root account"
  - Organized by risk profile levels (commonly Level 1: baseline, Level 2: stricter, more operationally intrusive)
  - Frequently used as the direct basis for automated cloud security posture scanning tools
  - Complements, rather than replaces, the shared responsibility model — it's specifically about the customer's side of that split
- **related:** `cloud-shared-responsibility`, `aws-organizations-scp`

#### `aws-organizations-scp` — AWS Organizations & SCPs (Service Control Policies)
- **type:** tool
- **summary:** AWS Organizations centrally manages multiple AWS accounts; Service Control Policies act as guardrails that cap the maximum permissions available across those accounts, regardless of what any single account's own IAM policies allow.
- **core_idea:** An SCP can only take permissions away, never grant them — it's a ceiling on what IAM is allowed to permit, not a substitute for IAM.
- **bullets:**
  - Organizations enables consolidated billing and centralized policy management across many accounts
  - SCPs set the maximum possible permission boundary — even an account admin with full IAM access can't exceed what the SCP allows
  - Common use: blocking entire AWS services or regions organization-wide, regardless of individual account configuration
  - Doesn't replace IAM — a permission must be allowed by *both* the SCP and the account's own IAM policy to actually work
- **related:** `aws-iam-least-privilege`, `cis-cloud-benchmarks`

### `cloud-identity-access` → `iam-and-key-management`

#### `aws-iam-least-privilege` — AWS IAM & Least Privilege
- **type:** concept
- **summary:** AWS Identity and Access Management controls who and what can do what to AWS resources, via users, groups, roles, and policies — and least privilege means granting only the specific permissions actually needed, nothing broader.
- **core_idea:** Start every IAM policy from zero permissions and add exactly what's needed — never start broad and try to narrow down later.
- **bullets:**
  - Avoid wildcard actions/resources (`"Action": "*"`) except in narrowly justified cases
  - IAM roles are strongly preferred over long-lived access keys, especially for workloads (EC2 instance roles, Lambda execution roles)
  - Overly permissive IAM policies are consistently one of the top root causes in cloud breach post-mortems
  - Policy evaluation logic matters: explicit denies always override allows, across both identity-based and resource-based policies
- **related:** `least-privilege-principle`, `aws-organizations-scp`

#### `aws-kms-key-management` — AWS KMS & Key Management
- **type:** tool
- **summary:** AWS Key Management Service is the managed service for creating and controlling the encryption keys used across other AWS services, built around an envelope-encryption pattern rather than encrypting everything with one master key directly.
- **core_idea:** KMS almost never encrypts your actual data directly with a master key — it uses that key to protect a separate data key, which does the real work.
- **bullets:**
  - Customer Master Keys (CMKs) generate and protect data keys, rather than encrypting bulk data directly (envelope encryption)
  - Key policies — separate from IAM policies — control who can use or manage a given key, and are evaluated alongside IAM
  - Automatic key rotation is available for many key types, reducing long-term exposure of any single key
  - Nearly every other AWS service (S3, EBS, RDS, Secrets Manager) integrates with KMS for encryption at rest
- **related:** `secrets-manager-parameter-store`, `pki-public-key-infrastructure`

### `cloud-network-compute` → `network-isolation-and-compute`

#### `aws-vpc-security-groups` — AWS VPC & Security Groups
- **type:** concept
- **summary:** A VPC (Virtual Private Cloud) is an isolated virtual network within AWS; security groups are stateful, instance-level virtual firewalls that control what traffic can reach (and leave) a resource.
- **core_idea:** Security groups only ever say "yes" — there's no explicit deny rule, so tightening access means removing an allow, not adding a block.
- **bullets:**
  - Security groups are stateful: an allowed inbound connection automatically permits its return traffic, no explicit outbound rule needed
  - NACLs (Network ACLs), by contrast, are stateless and operate at the subnet level, and can include explicit deny rules — a genuinely different tool from security groups
  - Default security group behavior is deny-all inbound, allow-all outbound — tightening almost always means restricting outbound too
  - VPC design (public/private subnets, NAT gateways) shapes what even needs a security group rule in the first place
- **related:** `firewall-fundamentals`, `ec2-instance-hardening`

#### `ec2-instance-hardening` — EC2 Instance Hardening
- **type:** concept
- **summary:** The practices for reducing an EC2 instance's attack surface: disabling unused services, keeping the OS patched, restricting remote access, and using instance roles instead of embedded credentials.
- **core_idea:** An EC2 instance is still just a server — cloud-native tooling helps, but it doesn't replace ordinary OS hardening discipline.
- **bullets:**
  - Restrict SSH/RDP access tightly (specific source IPs, bastion hosts, or Systems Manager Session Manager instead of open inbound access)
  - Use IAM instance roles rather than embedding long-lived access keys on the instance itself
  - IMDSv2 (Instance Metadata Service v2) requires session tokens for metadata requests, closing off a known SSRF-based credential theft path that IMDSv1 was vulnerable to
  - Keep the OS and installed packages patched — cloud doesn't change this baseline requirement
- **related:** `aws-vpc-security-groups`, `aws-iam-least-privilege`

#### `lambda-security-execution-role` — Lambda Security & Execution Roles
- **type:** concept
- **summary:** AWS Lambda functions run under an assigned IAM execution role that defines exactly which AWS resources the function is allowed to touch — serverless removes the server to patch, but not the need for least-privilege access design.
- **core_idea:** "Serverless" only means there's no server for you to patch — it doesn't mean there's nothing left to secure.
- **bullets:**
  - The execution role is the function's entire permission boundary — overly broad execution roles are a common serverless misconfiguration
  - Function code can still have ordinary vulnerabilities: injection, insecure deserialization, vulnerable dependencies
  - Environment variables often carry secrets/config and should be encrypted (via KMS) rather than left in plaintext
  - Event source misconfigurations (e.g. an overly permissive trigger) can expose a function to unintended callers
- **related:** `aws-iam-least-privilege`, `ec2-instance-hardening`

### `cloud-data-secrets` → `storage-and-secrets`

#### `s3-public-bucket-exposure` — S3 Public Bucket Exposure
- **type:** concept
- **summary:** One of the most common and consequential cloud misconfigurations: an S3 bucket left publicly readable (or writable) due to overly permissive bucket policies, ACLs, or disabled account-level protections.
- **core_idea:** An S3 bucket is private by default — every public exposure incident is a specific, identifiable configuration change someone made, not an inherent platform risk.
- **bullets:**
  - Causes: overly broad bucket policies, legacy ACLs granting "Everyone" access, or disabling account/bucket-level "Block Public Access" settings
  - AWS added account-wide and bucket-level "Block Public Access" settings specifically because this misconfiguration recurred so often
  - Public *write* access is even more dangerous than public read — it allows tampering or hosting malicious content, not just data leakage
  - Regularly audited via automated tools, since a single misconfigured bucket has been the root cause of numerous large public breaches
- **related:** `aws-iam-least-privilege`, `data-loss-water-analogy`

#### `secrets-manager-parameter-store` — Secrets Manager & Parameter Store
- **type:** tool
- **summary:** Two AWS services for keeping configuration and secrets out of application code — Secrets Manager is purpose-built for secrets with automatic rotation; Parameter Store is a more general configuration store that can also hold secrets, without built-in rotation.
- **core_idea:** The right question isn't "which service stores secrets" — both do — it's "do I need automatic rotation," since that's the real dividing line.
- **bullets:**
  - Secrets Manager: built specifically for secrets (DB credentials, API keys), with native automatic rotation support and higher per-secret cost
  - Parameter Store (part of Systems Manager): general-purpose config storage, supports a `SecureString` type for secrets, but no built-in rotation
  - Both integrate with KMS for encryption at rest and IAM for access control
  - Hardcoding secrets in code or environment files remains one of the most common findings in cloud security audits, despite both of these services existing specifically to prevent it
- **related:** `aws-kms-key-management`

#### `data-loss-water-analogy` — Data Loss Prevention (Water Analogy)
- **type:** concept
- **summary:** DLP is easiest to understand through an analogy: sensitive data behaves like water — it will find and flow through any unblocked gap (email attachments, USB drives, cloud uploads, screenshots) unless it's actively contained at each exit point.
- **core_idea:** You don't stop water by building one big wall — you seal every gap it could flow through, because it only takes one.
- **bullets:**
  - DLP tools monitor and block sensitive data across three states: at rest (stored), in transit (moving across a network), and in use (actively being accessed/copied)
  - Classification comes first — DLP can't protect "sensitive data" it hasn't been told how to recognize
  - In cloud environments specifically, CASB (Cloud Access Security Broker) tools extend DLP visibility into SaaS apps and cloud storage that traditional network-based DLP can't see into
  - Like a physical leak, the hardest part is rarely the big obvious gap — it's the small, unnoticed one (a misconfigured share, a forgotten export)
- **related:** `s3-public-bucket-exposure`, `dlp-five-cs-data-protection`

### `cloud-workloads-containers` → `containers-and-kubernetes`

#### `container-image-scanning` — Container Image Scanning
- **type:** tool
- **summary:** Automated scanning of container images for known vulnerabilities in OS packages and application dependencies, ideally run before an image is ever deployed rather than only against running containers.
- **core_idea:** A container image is a frozen snapshot of every dependency's known vulnerabilities at build time — scanning it is how you find out what you're about to ship.
- **bullets:**
  - Scans both OS-level packages baked into the image and application-level dependencies
  - Best integrated into the CI/CD pipeline (shift-left) so vulnerable images are caught before deployment, not after
  - Closely related to SCA and SBOM concepts, but specifically scoped to the container image layer format
  - Base image choice matters enormously — a minimal/distroless base image starts with a much smaller vulnerability surface than a full OS image
- **related:** `sca-dependency-scanning`, `kubernetes-rbac-basics`

#### `kubernetes-rbac-basics` — Kubernetes RBAC Basics
- **type:** concept
- **summary:** Kubernetes' native access control system: Roles and ClusterRoles define what actions are permitted, while RoleBindings and ClusterRoleBindings assign those permissions to users or service accounts.
- **core_idea:** In Kubernetes, permissions and their assignment are always two separate objects — defining a Role does nothing until a Binding actually grants it to someone.
- **bullets:**
  - Role / RoleBinding: scoped to a single namespace
  - ClusterRole / ClusterRoleBinding: scoped cluster-wide, across all namespaces
  - A very common misconfiguration: binding the built-in `cluster-admin` ClusterRole far more broadly than intended
  - Service accounts (used by pods/workloads, not humans) need the same least-privilege scrutiny as human user accounts
- **related:** `container-image-scanning`, `access-control-models`

### `cloud-workloads-containers` → `application-platform-security`

#### `cms-security-model` — CMS Security Model
- **type:** concept
- **summary:** *(Naming note: "CMS" here is ambiguous without the original leaf content to confirm — most likely Content Management System security, given this topic's placement under application-platform-security within cloud workloads, i.e. securing a CMS platform deployed on cloud infrastructure. Worth confirming against the live leaf before treating this as final.)* Content Management Systems (WordPress, Drupal, and similar) carry a distinct risk profile from custom-built applications: a large, frequently-changing plugin/theme ecosystem outside the core platform's own security control.
- **core_idea:** A CMS's core may be well-audited, but its risk profile is really set by whichever third-party plugin was installed and never updated again.
- **bullets:**
  - Common CMS risks: outdated plugins/themes, weak or default admin credentials, exposed and unhardened admin panels
  - Plugin/theme ecosystems are typically the largest and least-audited part of the attack surface, not the CMS core itself
  - Cloud hosting adds its own layer: the CMS still needs its own hardening even though the underlying infrastructure may be managed
  - Update cadence discipline matters more here than for custom apps, given how publicly known CMS plugin vulnerabilities tend to be
- **related:** `web-hardening-baseline-apache-iis`

### `cloud-threat-detection` → `logging-and-detection-services`

#### `cloudtrail-logging` — CloudTrail Logging
- **type:** tool
- **summary:** AWS's service for recording API calls made within an account — who did what, when, and from where — forming the foundational audit trail for nearly all AWS-based detection and forensics.
- **core_idea:** In AWS, if an action isn't in CloudTrail, there's effectively no record it ever happened.
- **bullets:**
  - Should be enabled account-wide (and organization-wide, for multi-account setups), not just for specific services
  - Best practice: send logs to a separate, access-restricted account/bucket specifically to prevent an attacker with access from tampering with or deleting the trail
  - Feeds directly into other detection tooling — CloudWatch alarms and GuardDuty both rely on CloudTrail data
  - Distinguishes management events (account/service configuration changes) from data events (e.g. individual S3 object access), which are often logged separately
- **related:** `cloudwatch-security-alarms`, `siem-correlation-use-cases`

#### `cloudwatch-security-alarms` — CloudWatch Security Alarms
- **type:** tool
- **summary:** AWS's monitoring and observability service, used for security purposes by building alarms on top of CloudTrail and other log sources to flag specific suspicious patterns as they happen.
- **core_idea:** Logs that nobody's watching are just an expensive archive — CloudWatch alarms are what turn passive logging into an actual alert.
- **bullets:**
  - Common security alarms: root account usage, unauthorized API calls (`AccessDenied` patterns), security group changes, IAM policy modifications
  - Typically built by feeding CloudTrail logs into CloudWatch Logs, then defining metric filters and alarms on specific patterns
  - Alarms can trigger automated remediation (via Lambda) in addition to human notification
  - Alarm design is a real discipline of its own — too sensitive and it's ignored as noise, too loose and it misses real incidents
- **related:** `cloudtrail-logging`, `aws-guardduty-overview`

#### `aws-guardduty-overview` — AWS GuardDuty Overview
- **type:** tool
- **summary:** A managed threat-detection service that continuously analyzes CloudTrail, VPC Flow Logs, and DNS logs for malicious or anomalous activity, using machine learning and threat intelligence — with no agents to install.
- **core_idea:** GuardDuty doesn't watch your infrastructure directly — it watches the logs your infrastructure was already producing, and looks for what shouldn't be there.
- **bullets:**
  - Data sources analyzed: CloudTrail (API activity), VPC Flow Logs (network traffic), DNS query logs
  - Detection combines threat intelligence feeds (known malicious IPs/domains) with anomaly detection (unusual API call patterns, cryptocurrency-mining-like behavior)
  - No agents required — it operates purely on existing telemetry the account is already generating
  - Findings are severity-scored, meant to be triaged and fed into an incident response process, not treated as automatically confirmed incidents
- **related:** `cloudwatch-security-alarms`, `cloudtrail-logging`

---

## 7. Detection & Monitoring

### `digital-forensics` → `evidence-handling`

#### `chain-of-custody` — Chain of Custody
- **type:** concept
- **summary:** The documented, unbroken record of who collected, handled, transferred, and stored a piece of digital evidence, from seizure until it's presented — critical for the evidence to remain admissible and credible.
- **core_idea:** Evidence that's technically accurate but poorly documented is functionally worthless in court — chain of custody is what proves nobody could have tampered with it along the way.
- **bullets:**
  - Every transfer of evidence (person to person, location to location) must be logged with date, time, and purpose
  - A gap or inconsistency in the chain gives opposing counsel grounds to challenge the evidence's integrity entirely
  - Hashing evidence (MD5/SHA) at collection and re-verifying at each subsequent step proves the data itself wasn't altered
  - Applies equally to physical media (drives, phones) and digital copies/images made from them
- **related:** `disk-imaging-dd`, `forensic-tool-validation-black-box-defense`, `legal-issues-cybersecurity`

#### `legal-issues-cybersecurity` — Legal Issues in Cybersecurity
- **type:** concept
- **summary:** The legal considerations that intersect with forensic and incident response work — evidence admissibility, search authority, jurisdiction, and the boundary between authorized investigation and unlawful access.
- **core_idea:** Being technically capable of collecting evidence doesn't automatically make it legal or admissible — the legal framework around an investigation matters as much as the technical process.
- **bullets:**
  - Search and seizure authority differs significantly between law enforcement (warrants) and private-sector incident response (consent, policy, ownership)
  - Jurisdiction complicates cross-border incidents — data, attacker, and victim may all sit under different legal regimes
  - Evidence admissibility standards generally require demonstrating both proper chain of custody and validated forensic tooling
  - Involve legal counsel early, not as an afterthought, particularly when law enforcement referral or litigation is plausible
- **related:** `chain-of-custody`, `forensic-tool-validation-black-box-defense`, `ir-regulatory-notification`

#### `forensic-tool-validation-black-box-defense` — Forensic Tool Validation ("Black Box" Defense)
- **type:** concept
- **summary:** Independently verifying that forensic tools produce accurate, repeatable results before relying on their output as evidence — an unvalidated tool's findings can be challenged simply by questioning whether the tool itself is trustworthy.
- **core_idea:** If a defense attorney can successfully argue "we don't actually know this tool works correctly," the evidence itself becomes suspect regardless of how compelling its output looked.
- **bullets:**
  - Validation means testing a tool against known data sets with known-correct results, not just trusting vendor claims
  - NIST's Computer Forensics Tool Testing (CFTT) program is a recognized reference point for independently validated forensic tooling
  - Using multiple independent tools to cross-verify a critical finding strengthens the credibility of the result
  - Sometimes called the "black box" problem — a tool whose internal correctness hasn't been independently confirmed
- **related:** `chain-of-custody`, `disk-imaging-dd`, `memory-forensics-volatility`

### `digital-forensics` → `forensic-acquisition-analysis`

#### `disk-imaging-dd` — Disk Imaging with dd
- **type:** tool
- **summary:** Creating a bit-for-bit copy of a storage device using low-level tools like `dd`, so forensic analysis is performed on an exact duplicate rather than the original evidence.
- **core_idea:** Never analyze the original — every forensic action after imaging happens on a copy, precisely so the original stays provably untouched.
- **bullets:**
  - `dd if=/dev/sdX of=image.img` copies raw bytes from a source device to an image file, independent of filesystem structure
  - Write-blockers are used during acquisition to physically or logically guarantee the original media can't be modified
  - Hash the source and the resulting image immediately after imaging — matching hashes prove the copy is a faithful bit-for-bit duplicate
  - `dd` copies everything, including deleted/unallocated space, which is often where the most forensically interesting data hides
- **related:** `chain-of-custody`, `memory-forensics-volatility`, `forensic-tool-validation-black-box-defense`

#### `memory-forensics-volatility` — Memory Forensics with Volatility
- **type:** tool
- **summary:** Analyzing a captured RAM image to recover running processes, network connections, injected code, and other artifacts that exist only in volatile memory and never touch disk.
- **core_idea:** Some of the most useful evidence — an active malicious process, a decrypted credential in memory, an in-progress connection — exists nowhere except RAM, and disappears the moment the machine powers off.
- **bullets:**
  - Volatility is the standard open-source framework for parsing memory images across Windows, Linux, and macOS
  - Common analysis targets: running process list, loaded DLLs/modules, open network connections, command history, injected code in legitimate processes
  - Memory acquisition must happen before disk imaging in most live-response scenarios, since memory contents are lost on shutdown
  - Fileless malware is specifically designed to be invisible to disk-based forensics — memory analysis is often the only way to catch it
- **related:** `disk-imaging-dd`, `edr-vs-traditional-av`, `malware-taxonomy`

### `security-operations-monitoring` → `ids-ips-architecture`

#### `ids-functional-components` — IDS Functional Components
- **type:** concept
- **summary:** The core building blocks of any Intrusion Detection System — sensors that collect data, an analysis engine that evaluates it against rules or models, and an alerting mechanism that surfaces findings.
- **core_idea:** An IDS is only as good as its weakest component — a great analysis engine fed by blind sensors, or great sensors feeding an untuned engine, both fail the same way.
- **bullets:**
  - Sensors: collect raw data — network taps/spans for NIDS, host-level logs/system calls for HIDS
  - Analysis engine: compares collected data against signatures (known patterns) or behavioral baselines (anomaly detection)
  - Alerting/reporting: surfaces detections to analysts with enough context to triage without immediately pivoting to raw logs
  - Management console: centralizes configuration, tuning, and correlation across potentially many distributed sensors
- **related:** `ids-deployment-types`, `ids-analysis-methods`, `snort-signature-basics`

#### `ids-deployment-types` — IDS Deployment Types
- **type:** concept
- **summary:** Where an IDS sits and what it monitors defines its type — Network IDS (NIDS) watches traffic on the wire, Host IDS (HIDS) watches activity on an individual endpoint.
- **core_idea:** NIDS sees what crosses the network; HIDS sees what happens after it arrives — an attack that evades one is often still visible to the other.
- **bullets:**
  - NIDS: deployed at network chokepoints (span port, tap, inline), sees traffic across many hosts but nothing encrypted or purely local
  - HIDS: runs on the endpoint itself, sees file changes, process activity, and local system calls — visibility encryption can't hide from it
  - Inline (in-path) deployment can actively block traffic (functioning as IPS); passive (out-of-path) deployment only observes and alerts
  - Modern architectures typically layer both — NIDS for network-wide visibility, HIDS/EDR for endpoint-level depth
- **related:** `ids-functional-components`, `edr-vs-traditional-av`, `firewall-fundamentals`

#### `ids-analysis-methods` — IDS Analysis Methods
- **type:** concept
- **summary:** The two dominant approaches an IDS uses to decide something is malicious — signature-based (matching known attack patterns) and anomaly-based (flagging deviation from an established normal baseline).
- **core_idea:** Signature detection catches what's already been seen before; anomaly detection tries to catch what hasn't — and each fails in exactly the way the other succeeds.
- **bullets:**
  - Signature-based: highly accurate against known threats, essentially blind to novel or modified attacks not yet in the signature database
  - Anomaly-based: can catch genuinely new attack patterns, but tends toward higher false-positive rates since "abnormal" isn't always "malicious"
  - Anomaly detection requires an established behavioral baseline — poor baselining is a common cause of both missed detections and alert fatigue
  - Most mature detection stacks combine both approaches rather than relying on either exclusively
- **related:** `ids-functional-components`, `snort-signature-basics`, `sigma-detection-rules`, `aws-guardduty-overview`

#### `snort-signature-basics` — Snort Signature Basics
- **type:** tool
- **summary:** Snort is an open-source, signature-based network intrusion detection/prevention system that inspects traffic against a defined rule set to flag or block matching patterns.
- **core_idea:** A Snort rule is a precise, human-readable statement of "if traffic looks exactly like this, alert" — writing good rules is the difference between a useful detection and background noise.
- **bullets:**
  - Rule structure: rule header (action, protocol, source/destination, port) plus rule options (content match, flags, message text)
  - Example action types: `alert` (flag it), `drop` (block it inline), `log` (record without alerting)
  - Content matching can inspect packet payloads directly, not just header fields — enabling detection of specific exploit or malware signatures
  - Poorly tuned or overly broad rules are a leading cause of alert fatigue in signature-based detection environments
- **related:** `ids-analysis-methods`, `sigma-detection-rules`, `wireshark-display-filters`

### `security-operations-monitoring` → `detection-engineering`

#### `sigma-detection-rules` — Sigma Detection Rules
- **type:** tool
- **summary:** An open, generic, YAML-based rule format for describing log-based detection logic in a SIEM-agnostic way — a Sigma rule can be translated into the query syntax of many different SIEM platforms rather than being locked to one.
- **core_idea:** Sigma exists so a detection engineer writes the logic once, in plain language, instead of rewriting the same detection idea separately for every SIEM platform an organization happens to use.
- **bullets:**
  - Rules are structured YAML describing a detection's log source, selection criteria, and condition logic
  - Converters translate Sigma rules into platform-specific query languages (e.g. Splunk SPL, Elastic queries)
  - Widely used to share and standardize detection content across the community — similar in spirit to how YARA standardizes malware signatures
  - Complements rather than replaces signature-based network IDS — Sigma operates on log data, not raw network packets
- **related:** `siem-correlation-use-cases`, `snort-signature-basics`, `yara-rule-basics`

#### `tripwire-file-integrity-monitoring` — Tripwire & File Integrity Monitoring
- **type:** tool
- **summary:** File Integrity Monitoring (FIM) tools like Tripwire establish a baseline hash of critical system files and alert when those files change unexpectedly — a direct detective control for unauthorized modification.
- **core_idea:** If a critical system file's hash changes and nobody authorized that change, something is already wrong — FIM is the tripwire, literally, for exactly that scenario.
- **bullets:**
  - Baseline is established by hashing a known-good set of critical files (binaries, configs, libraries)
  - Any subsequent hash change triggers an alert, whether the change was malicious or a legitimate unmanaged update
  - Directly supports integrity, one leg of the CIA triad — detecting unauthorized tampering after the fact, even if prevention failed
  - Requires baseline updates whenever legitimate patches/changes occur, or the tool generates constant false positives
- **related:** `cia-triad`, `siem-correlation-use-cases`, `chain-of-custody`

### `security-operations-monitoring` → `siem-and-correlation`

#### `siem-correlation-use-cases` — SIEM Correlation Use Cases
- **type:** concept
- **summary:** A Security Information and Event Management (SIEM) platform aggregates logs from across an environment and applies correlation rules to detect patterns that no single log source would reveal on its own.
- **core_idea:** A single failed login means nothing; a hundred failed logins across different accounts followed by one success, correlated together, means something — SIEM exists to connect exactly those dots.
- **bullets:**
  - Correlation rules combine events across multiple sources/time windows — e.g. failed logins followed by a successful login from a new location
  - Centralizing logs solves the "attacker deleted the local log" problem — logs shipped elsewhere survive local tampering
  - Effectiveness depends entirely on log source coverage and quality — a SIEM can't correlate data it never receives
  - Increasingly paired with SOAR platforms to move from "alert generated" to "automated response triggered"
- **related:** `log-source-prioritization`, `sigma-detection-rules`, `soc-tiering-escalation`, `cloudwatch-security-alarms`

#### `log-source-prioritization` — Log Source Prioritization
- **type:** concept
- **summary:** Not every log source is equally valuable for detection — prioritizing which sources to collect, retain, and actively monitor is a practical necessity given storage, cost, and analyst attention are all finite.
- **core_idea:** Collecting every log from everything sounds thorough but produces a haystack too large to search — prioritization is choosing which logs actually earn their storage and attention cost.
- **bullets:**
  - High-priority sources typically include authentication logs, endpoint/EDR telemetry, and perimeter/firewall logs — where most detectable attacker activity surfaces
  - Retention requirements are often driven by compliance mandates (PCI-DSS, HIPAA) as much as by detection value
  - Under-prioritized sources become blind spots — attackers who understand an environment's logging gaps will route through them deliberately
  - Should be revisited periodically as infrastructure and the threat landscape change, not set once and forgotten
- **related:** `siem-correlation-use-cases`, `unix-logging-fundamentals`, `compliance-drivers-by-industry`

#### `unix-logging-fundamentals` — Unix Logging Fundamentals
- **type:** concept
- **summary:** The core logging facilities on Unix/Linux systems — syslog and its modern successors — that record system, authentication, and application events into structured, centrally forwardable log streams.
- **core_idea:** Everything a Unix system does that matters for security eventually passes through syslog (or its modern equivalent) — knowing where to look is half of investigation.
- **bullets:**
  - Traditional syslog routes messages by facility (auth, kern, mail, etc.) and severity level to configured destinations
  - `/var/log/auth.log` (Debian-based) or `/var/log/secure` (RHEL-based) specifically track authentication events — a first stop in most investigations
  - journald (systemd-based systems) provides structured, indexed logging, often queried via `journalctl` rather than flat text files
  - Centralized log forwarding protects log integrity against local tampering by an attacker with root access
- **related:** `log-source-prioritization`, `siem-correlation-use-cases`, `grep-recursive-content-search`

### `security-operations-monitoring` → `endpoint-and-network-visibility` → `network-visibility-tools`

#### `tcpdump-cli-packet-analysis` — tcpdump CLI Packet Analysis
- **type:** tool
- **summary:** A command-line packet capture and analysis tool, functionally similar to Wireshark's capture engine but designed for headless, scriptable use directly on a server or network device.
- **core_idea:** tcpdump is what you reach for when there's no GUI available — the same packet truth Wireshark shows visually, captured and filtered from a terminal.
- **bullets:**
  - Basic capture: `tcpdump -i eth0` captures live traffic on a specified interface
  - Uses BPF (Berkeley Packet Filter) syntax for capture filters — the same filter language Wireshark's capture filters are built on
  - `-w file.pcap` writes a capture to disk for later analysis in Wireshark, bridging CLI capture and GUI analysis workflows
  - Frequently the only packet capture option available on production servers, routers, and other systems without a GUI
- **related:** `wireshark-display-filters`, `wireshark-hex-header-fields`, `icmp-diagnostics-ping-traceroute`

### `security-operations-monitoring` → `endpoint-and-network-visibility` → `endpoint-detection`

#### `edr-vs-traditional-av` — EDR vs. Traditional Antivirus
- **type:** concept
- **summary:** Endpoint Detection and Response (EDR) goes beyond traditional signature-based antivirus by continuously monitoring endpoint behavior, retaining historical telemetry, and enabling active investigation and response — not just block-and-alert on known malware.
- **core_idea:** Traditional AV answers "have I seen this exact file before"; EDR answers "does this behavior look wrong," and keeps a record so you can reconstruct what happened even after the fact.
- **bullets:**
  - Traditional AV: primarily signature/hash-based, effective against known malware, largely blind to novel or fileless techniques
  - EDR: continuous behavioral monitoring, records process trees and system activity, supports retroactive investigation ("what did this endpoint do over the last 30 days")
  - EDR platforms typically support active response actions directly — isolating a host, killing a process, remotely collecting forensic artifacts
  - Most modern endpoint protection platforms combine both approaches rather than treating them as separate products
- **related:** `ids-deployment-types`, `memory-forensics-volatility`, `soc-tiering-escalation`

### `security-operations-monitoring` → `soc-operations`

#### `soc-tiering-escalation` — SOC Tiering & Escalation
- **type:** concept
- **summary:** Security Operations Centers typically structure analysts into tiers — Tier 1 performs initial triage, Tier 2 handles deeper investigation, Tier 3 handles advanced threat hunting and incident leadership — with alerts escalating up as complexity increases.
- **core_idea:** Not every alert needs your most senior analyst, and every alert that does need them shouldn't have to wait behind a hundred that didn't — tiering exists to route effort where it's actually needed.
- **bullets:**
  - Tier 1: initial alert triage, basic investigation, filtering false positives before escalation
  - Tier 2: deeper investigation of escalated alerts, correlation across multiple data sources, containment actions
  - Tier 3: advanced threat hunting, complex incident leadership, often involved in tooling/detection engineering
  - Well-defined escalation criteria prevent both under-escalation (a real incident stuck at Tier 1) and over-escalation (senior analysts drowning in noise)
- **related:** `alert-triage-prioritization`, `ir-detection-triage`, `edr-vs-traditional-av`

#### `alert-triage-prioritization` — Alert Triage & Prioritization
- **type:** concept
- **summary:** The process of deciding, out of a large volume of incoming alerts, which ones warrant immediate attention, based on severity, asset criticality, and confidence that the alert reflects real malicious activity.
- **core_idea:** An alert queue with a thousand items and one analyst isn't solved by working faster — it's solved by deciding correctly, fast, which handful of those items actually matter.
- **bullets:**
  - Triage typically weighs three factors: alert confidence (how likely it's a true positive), asset criticality, and potential impact
  - Alert fatigue — desensitization from excessive false positives — is one of the most damaging outcomes of poorly tuned detection content
  - Enrichment (adding threat intel context, asset ownership, historical alert patterns) speeds triage by reducing manual lookup time per alert
  - Automated triage/SOAR playbooks increasingly handle the highest-volume, lowest-complexity decisions, freeing analysts for genuinely ambiguous cases
- **related:** `soc-tiering-escalation`, `siem-correlation-use-cases`, `ir-detection-triage`

#### `honeypots-honeynets-padded-cell` — Honeypots, Honeynets & Padded Cells
- **type:** concept
- **summary:** Decoy systems (honeypots) or entire decoy networks (honeynets) deliberately deployed to attract attacker activity, providing early detection and intelligence on attacker behavior without risking production assets. A padded cell redirects a detected intruder into a decoy environment after initial detection, contained without their knowledge.
- **core_idea:** A honeypot's value isn't stopping an attacker — it's that any activity against it is, by definition, unauthorized, making detection nearly free of false positives.
- **bullets:**
  - Any interaction with a honeypot is inherently suspicious — legitimate users have no reason to touch a system that exists only as bait
  - Honeynets extend the concept to a full simulated network, useful for observing lateral movement behavior in a contained environment
  - Padded cell systems redirect a detected intruder into an isolated decoy environment, letting defenders observe further actions safely
  - This defensive/detection framing is distinct from the offensive-security use of honeypots as a deception technique during engagements — cross-linked, not duplicated
- **related:** `honeypots`, `ids-analysis-methods`, `edr-vs-traditional-av`

### `incident-response` → `ir-lifecycle`

#### `ir-lifecycle-nist` — NIST Incident Response Lifecycle
- **type:** concept
- **summary:** NIST's current incident response guidance (SP 800-61r3, finalized April 2025) replaced the older 4-phase model (Preparation; Detection & Analysis; Containment, Eradication & Recovery; Post-Incident Activity) with a model built directly on the six NIST CSF 2.0 Functions — Govern, Identify, Protect, Detect, Respond, Recover.
- **core_idea:** Incident response used to be treated as its own separate, cyclical process — NIST's current model instead treats it as continuously integrated into everyday cybersecurity risk management, not a separate activity that starts only when something goes wrong.
- **bullets:**
  - Govern, Identify, and Protect are preparation-focused Functions: they help prevent incidents and prepare the organization to handle the ones that do occur
  - Detect, Respond, and Recover are the active incident-handling Functions: discovering, containing, eradicating, and recovering from an incident, plus reporting and communications
  - The prior 4-phase model's phases map directly onto these Functions — e.g. "Containment, Eradication & Recovery" now falls under Respond and Recover
  - A key shift: continuous improvement (captured under Identify's Improvement category) feeds lessons learned back into all six Functions on an ongoing basis, not just after formal incident closure
- **related:** `containment-strategies`, `ir-eradication`, `ir-recovery-monitoring`, `ir-preparation-runbooks`

#### `containment-strategies` — Containment Strategies
- **type:** concept
- **summary:** Actions taken to stop an incident from spreading further or causing additional damage, while balancing the operational cost of containment against the risk of letting an incident continue unchecked.
- **core_idea:** Containment is a trade-off, not a free action — isolating a compromised system stops the bleeding, but it can also destroy evidence or disrupt business operations if done carelessly.
- **bullets:**
  - Common tactics: network isolation/segmentation of affected hosts, disabling compromised accounts, blocking malicious IPs/domains at the perimeter
  - Strategy choice depends on incident type — rapid isolation for ransomware may differ from careful, quiet observation first for a slow-moving APT
  - Premature or clumsy containment can tip off an attacker, causing them to accelerate destructive actions or go further underground
  - Containment decisions often require balancing legal/evidentiary needs against operational urgency
- **related:** `ir-lifecycle-nist`, `ir-eradication`, `ir-evidence-preservation`

#### `ir-eradication` — Eradication
- **type:** concept
- **summary:** Removing the root cause of an incident from the environment entirely — malware, unauthorized accounts, backdoors, or the vulnerability that enabled initial access — rather than just stopping the immediate symptom.
- **core_idea:** Containing an incident stops it from spreading; eradication is making sure it can't come back the exact same way once systems are restored.
- **bullets:**
  - Requires first confirming the full scope of compromise — eradicating only part of an attacker's footprint often results in rapid reinfection
  - Includes patching the exploited vulnerability, not just removing the malware or account that exploited it
  - Rebuilding from known-clean images/backups is often more reliable than attempting to "clean" a compromised system in place
  - Root cause analysis performed here directly feeds into the lessons-learned/improvement stage of the lifecycle
- **related:** `containment-strategies`, `ir-recovery-monitoring`, `ir-root-cause-analysis`

#### `ir-recovery-monitoring` — Recovery & Post-Recovery Monitoring
- **type:** concept
- **summary:** Restoring affected systems and services back to normal operation, followed by heightened monitoring to confirm the incident is genuinely resolved and hasn't recurred.
- **core_idea:** Recovery isn't finished the moment systems come back online — it's finished once sustained monitoring confirms the threat actually stayed gone.
- **bullets:**
  - Restoration should come from verified clean backups/images, not from the potentially still-compromised original systems
  - Heightened monitoring immediately post-recovery specifically watches for indicators that eradication was incomplete
  - Recovery timelines can span weeks to months for complex incidents — current NIST guidance explicitly notes this has grown well beyond the historical "day or two" assumption
  - A phased return to full operation allows closer observation of each restored component
- **related:** `ir-eradication`, `ir-lifecycle-nist`, `ir-metrics-mttd-mttr`

### `incident-response` → `ir-preparation`

#### `ir-preparation-runbooks` — IR Preparation & Runbooks
- **type:** concept
- **summary:** The advance work that makes effective incident response possible — documented policies, procedures, and playbooks/runbooks that give responders concrete steps to follow rather than improvising during an active incident.
- **core_idea:** The middle of a live incident is the worst possible time to decide who's in charge or what step comes next — preparation exists so those decisions were already made calmly, in advance.
- **bullets:**
  - An incident response policy defines scope, roles/authorities, incident definitions, and prioritization guidelines — the foundation everything else builds on
  - Playbooks/runbooks provide actionable, scenario-specific steps (e.g. "ransomware playbook," "business email compromise playbook") rather than generic guidance
  - CISA publishes publicly available incident and vulnerability response playbooks as a reference model organizations can adapt
  - Preparation explicitly includes non-technical readiness — legal counsel, PR/communications templates, and clearly defined decision authority for high-impact actions
- **related:** `ir-tabletop-exercises`, `ir-lifecycle-nist`, `ir-stakeholder-comms`

#### `ir-tabletop-exercises` — Tabletop Exercises
- **type:** concept
- **summary:** Structured, discussion-based simulations of a security incident, walking stakeholders through a hypothetical scenario to test and refine response plans without any actual systems being touched.
- **core_idea:** A response plan that's never been rehearsed usually has gaps nobody noticed on paper — tabletop exercises surface those gaps cheaply, before a real incident forces you to discover them live.
- **bullets:**
  - Participants typically include not just technical responders but legal, communications, and leadership — the same cross-functional group a real incident would involve
  - Exercises are scenario-driven (e.g. "ransomware hits the finance server") and facilitated to surface decision points and plan gaps
  - Findings feed directly back into updating runbooks, policies, and role clarity — the exercise's value is in what it changes afterward
  - Regular cadence (e.g. annual or after major infrastructure changes) keeps plans realistic as the environment evolves
- **related:** `ir-preparation-runbooks`, `ir-root-cause-analysis`, `ir-stakeholder-comms`

### `incident-response` → `ir-detection-and-triage`

#### `ir-detection-triage` — Detection & Triage (Incident Response Context)
- **type:** concept
- **summary:** The initial phase of active incident handling — determining whether an observed adverse event actually constitutes a genuine cybersecurity incident, and if so, how urgently it needs to be handled.
- **core_idea:** Not every alert is an incident, and not every incident announces itself clearly — triage is the deliberate step of turning "something looks off" into "here's what actually happened and how bad it is."
- **bullets:**
  - NIST distinguishes an "event" (any observable occurrence) from an "incident" (one that actually or imminently jeopardizes confidentiality, integrity, or availability, or violates policy/law)
  - Initial triage determines scope, likely severity, and which playbook/runbook applies before deeper investigation begins
  - Speed matters here disproportionately — early triage decisions shape how much damage occurs before containment even begins
  - This IR-specific triage builds directly on the same SOC alert-triage skills, applied at incident-confirmation scale rather than per-alert scale
- **related:** `alert-triage-prioritization`, `ir-threat-hunting`, `ir-lifecycle-nist`

#### `ir-threat-hunting` — Threat Hunting
- **type:** concept
- **summary:** Proactively searching an environment for signs of compromise that existing automated detection hasn't already flagged, based on a hypothesis about likely attacker behavior rather than waiting for an alert to trigger.
- **core_idea:** Threat hunting starts from the assumption that something is already there and undetected — the hunt is looking for it deliberately, not waiting for it to trip an alarm.
- **bullets:**
  - Hypothesis-driven: a hunt typically starts from a specific idea ("if an attacker used technique X, what artifact would that leave") rather than open-ended searching
  - Frequently informed by threat intelligence and MITRE ATT&CK TTPs — hunting for the specific behaviors a relevant adversary is known to use
  - Distinct from reactive SOC monitoring — hunting assumes detection gaps exist and actively looks for what they might be missing
  - Findings from successful hunts often become new automated detection content, closing the gap for future occurrences of the same behavior
- **related:** `ir-detection-triage`, `mitre-attck-mapping`, `sigma-detection-rules`

### `incident-response` → `ir-evidence-and-reporting`

#### `ir-evidence-preservation` — Evidence Preservation (IR Context)
- **type:** concept
- **summary:** Ensuring that evidence relevant to an incident is captured and protected before it's lost to time, system changes, or containment/eradication actions that might otherwise overwrite or destroy it.
- **core_idea:** Every containment or recovery action has the potential to destroy exactly the evidence needed to understand what happened — preservation has to happen in parallel, not as an afterthought once response is "done."
- **bullets:**
  - Volatile evidence (memory, active network connections) must be captured before a system is rebooted, isolated, or rebuilt
  - Preservation actions should follow the same chain-of-custody discipline as formal digital forensics work, even during active response
  - Balancing preservation against urgent containment needs is a recurring judgment call — over-prioritizing evidence can slow response to an ongoing active threat
  - Well-preserved evidence directly supports later root cause analysis, regulatory reporting, and any potential legal action
- **related:** `chain-of-custody`, `containment-strategies`, `ir-root-cause-analysis`

#### `post-incident-reporting` — Post-Incident Reporting
- **type:** concept
- **summary:** Formal documentation produced after an incident is resolved, summarizing what happened, how it was handled, and what should change — serving both internal improvement and, often, external/regulatory obligations.
- **core_idea:** An incident that's resolved but never properly documented teaches the organization nothing and satisfies no regulator — the report is where the incident's value as a lesson actually gets captured.
- **bullets:**
  - Typical contents: timeline of events, root cause, actions taken, business impact, and specific recommendations for improvement
  - Distinct audiences require distinct framings — a technical post-mortem for the security team differs from an executive summary for leadership
  - Feeds directly into the continuous improvement loop current NIST guidance treats as an ongoing Function, not a one-time closing task
  - May be a compliance requirement in itself, independent of any breach notification obligations
- **related:** `ir-root-cause-analysis`, `ir-metrics-mttd-mttr`, `ir-regulatory-notification`

#### `ir-root-cause-analysis` — Root Cause Analysis
- **type:** concept
- **summary:** Determining the underlying reason an incident was possible in the first place — not just what the attacker did, but what gap (technical, procedural, or human) allowed it — so the same gap can be closed rather than just the symptom treated.
- **core_idea:** Patching the specific malware or account an attacker used fixes today's incident; root cause analysis is what prevents tomorrow's version of the same one.
- **bullets:**
  - Distinguishes the proximate cause (the specific exploited vulnerability or mistake) from deeper contributing factors (missing patching process, inadequate monitoring)
  - Techniques like the "5 Whys" or fault-tree-style analysis help avoid stopping at the first superficial explanation
  - Findings should map to concrete, assignable remediation actions — a root cause identified but not acted on has no value
  - Feeds the improvement loop across all CSF Functions, not just future incident response — often surfaces gaps in Protect or Govern as much as Detect
- **related:** `ir-eradication`, `post-incident-reporting`, `fault-tree-analysis`

### `incident-response` → `ir-governance-and-comms`

#### `ir-stakeholder-comms` — Stakeholder Communications
- **type:** concept
- **summary:** Managing the flow of information to internal leadership, affected business units, and sometimes the public during and after an incident — a coordinated communications plan matters as much as the technical response.
- **core_idea:** A technically well-handled incident can still become a reputational disaster if communications are inconsistent, delayed, or contradict what eventually comes out anyway.
- **bullets:**
  - Leadership needs decision-relevant information (impact, options, risk) quickly — not raw technical detail
  - Public affairs/media relations should have a pre-defined engagement strategy, since incidents sometimes become public through channels the organization doesn't control
  - Legal counsel typically reviews external communications before release, given potential regulatory and litigation implications
  - Consistent internal messaging prevents conflicting information from different teams reaching stakeholders through separate, uncoordinated channels
- **related:** `ir-preparation-runbooks`, `ir-regulatory-notification`, `legal-issues-cybersecurity`

#### `ir-regulatory-notification` — Regulatory Notification Requirements
- **type:** concept
- **summary:** Many jurisdictions and industry regulations impose specific, often time-bound obligations to notify regulators and/or affected individuals when certain types of incidents (particularly data breaches) occur.
- **core_idea:** The clock on a breach notification requirement often starts the moment the incident is confirmed, not when investigation concludes — missing that window can carry its own separate penalty on top of the incident itself.
- **bullets:**
  - Requirements vary significantly by jurisdiction and sector — GDPR, HIPAA, and state breach notification laws each impose different triggers, timelines, and required content
  - Legal counsel involvement is typically necessary to correctly determine which notification obligations actually apply to a given incident
  - Notification timelines are frequently measured in days from discovery/confirmation, not from full resolution of the incident
  - Failure to notify appropriately can result in regulatory penalties independent of any damages caused by the incident itself
- **related:** `legal-issues-cybersecurity`, `ir-stakeholder-comms`, `compliance-drivers-by-industry`

#### `ir-ioc-sharing` — IOC Sharing
- **type:** concept
- **summary:** Distributing Indicators of Compromise discovered during an incident to trusted external parties — industry peers, ISACs, threat intelligence platforms — so others can detect or block the same threat before it reaches them.
- **core_idea:** An IOC you found during your incident is often still useful to someone else who hasn't been hit yet — sharing it turns your bad day into other organizations' successful prevention.
- **bullets:**
  - Common sharing formats/standards include STIX/TAXII, enabling structured, machine-readable IOC exchange between organizations and platforms
  - Information Sharing and Analysis Centers (ISACs) provide sector-specific trusted communities for this kind of exchange
  - Sharing must be balanced against sensitivity — sanitizing shared IOCs to avoid revealing more about the victim organization than intended
  - Feeds directly into other organizations' detection engineering — a shared IOC often becomes a new Sigma rule or SIEM correlation elsewhere
- **related:** `siem-correlation-use-cases`, `mitre-attck-mapping`, `sigma-detection-rules`

#### `ir-metrics-mttd-mttr` — IR Metrics: MTTD & MTTR
- **type:** concept
- **summary:** Mean Time to Detect (MTTD) and Mean Time to Respond/Recover (MTTR) are the two headline metrics used to measure incident response program effectiveness — how quickly incidents are noticed, and how quickly they're resolved once noticed.
- **core_idea:** You can't reliably improve what you don't measure — MTTD and MTTR turn "our IR program is good" into a number that can actually be tracked over time and across incidents.
- **bullets:**
  - MTTD: average time between an incident actually occurring and it being detected — heavily influenced by detection engineering and log source coverage
  - MTTR: average time between detection and full resolution/recovery — reflects containment, eradication, and recovery efficiency
  - Both metrics are most useful tracked as trends over time, rather than as single absolute numbers judged in isolation
  - Improving these metrics is a direct output of the continuous-improvement loop — lessons learned from each incident should measurably shorten the next one's timeline
- **related:** `ir-recovery-monitoring`, `post-incident-reporting`, `ir-lifecycle-nist`

---

## 8. Offensive Security

*(Seven leaves originally native to this domain relocate elsewhere per the structure plan — `security-core-vocabulary`, `information-assurance-pillars`, `threat-actor-sophistication`, `attack-surface-access-vectors` to Fundamentals; `aaa-access-control-model`, `password-attack-mitigations`, `authentication-failure-insight` to Identity. All seven are covered in those domains above, not duplicated here.)*

### `reconnaissance-osint` → `passive-and-active-recon`

#### `osint-passive-recon-toolkit` — OSINT & Passive Recon Toolkit
- **type:** concept
- **summary:** Open Source Intelligence gathering uses only publicly available information — never touching the target directly — to build a picture of an organization's exposed footprint before any active engagement begins.
- **core_idea:** Everything an organization has ever published, misconfigured to be public, or an employee has ever posted is fair game for OSINT — and it's often more revealing than the organization realizes.
- **bullets:**
  - Common sources: WHOIS records, public DNS, job postings (revealing tech stack), social media, public code repositories, breach databases
  - Passive recon carries essentially zero legal/detection risk since no request is ever sent directly to the target's infrastructure
  - Employee OSINT (LinkedIn roles, conference talks) frequently reveals internal tooling and org structure useful for later social engineering
  - Serves as the foundation for active recon — passive findings tell an attacker where to point active scanning efforts more precisely
- **related:** `footprinting-reconnaissance-techniques`, `google-dorking`, `shodan-asset-discovery`

#### `nmap-scanning-reference` — Nmap Scanning Reference
- **type:** tool
- **summary:** The standard tool for active network scanning — discovering live hosts, open ports, running services, and often service versions and OS fingerprints across a target network range.
- **core_idea:** Nmap turns "what's actually running on this network" from a guess into a mapped, enumerable answer — exactly why it's the first active tool most engagements reach for.
- **bullets:**
  - Common scan types: `-sS` (TCP SYN/stealth scan), `-sV` (service version detection), `-O` (OS fingerprinting), `-sU` (UDP scan)
  - SYN scans are considered "stealthier" because they never complete the TCP handshake, though modern logging/IDS still frequently detects them
  - `-A` combines several detection techniques (version detection, OS detection, script scanning) into one aggressive scan
  - Nmap Scripting Engine (NSE) extends functionality well beyond port scanning — vulnerability detection, brute-forcing, and enumeration scripts
- **related:** `osint-passive-recon-toolkit`, `footprinting-reconnaissance-techniques`, `icmp-diagnostics-ping-traceroute`

#### `shodan-asset-discovery` — Shodan Asset Discovery
- **type:** tool
- **summary:** A search engine that continuously scans the public internet and indexes exposed devices and services — letting anyone search for specific software versions, device types, or misconfigurations already sitting on the open internet.
- **core_idea:** Shodan already did the scanning for you — it's a search engine for "what's exposed to the internet right now," useful for defenders auditing their own exposure as much as attackers looking for one.
- **bullets:**
  - Indexes banners, service metadata, and sometimes default/exposed configuration screens across essentially the entire scanned IPv4 space
  - Frequently surfaces exposed industrial control systems, unsecured databases, and default-credential admin panels
  - Useful defensively for organizations to check what their own perimeter looks like from an outside attacker's perspective
  - Distinct from active scanning tools like Nmap — Shodan's data is pre-collected and searched, not scanned live at query time
- **related:** `osint-passive-recon-toolkit`, `nmap-scanning-reference`, `adversary-target-system-categories`

#### `google-dorking` — Google Dorking
- **type:** tool
- **summary:** Using advanced search engine query operators to find specific, often unintentionally exposed information indexed by search engines — exposed files, login pages, or misconfigured directories that weren't meant to be publicly discoverable.
- **core_idea:** If a search engine has crawled it, someone put it somewhere technically public — dorking is just knowing the query syntax to find what was never meant to be found this easily.
- **bullets:**
  - Common operators: `site:`, `filetype:`, `intitle:`, `inurl:` — narrowing search results to very specific exposure patterns
  - Frequently used to find exposed configuration files, login portals, or documents accidentally left in publicly crawlable directories
  - The "Google Hacking Database" (GHDB) catalogs known-useful dork queries for specific classes of exposure
  - Entirely passive from the target's perspective — no request ever reaches the target's own infrastructure directly
- **related:** `osint-passive-recon-toolkit`, `shodan-asset-discovery`

### `vulnerability-exploitation` → `memory-and-binary-exploitation`

#### `buffer-overflow-stack-layout` — Buffer Overflow & Stack Layout
- **type:** concept
- **summary:** Exploiting a buffer overflow requires understanding how the stack is actually laid out in memory — local variables, saved registers, and the return address — so an overflow can be crafted to overwrite exactly the right bytes.
- **core_idea:** A stack-based buffer overflow works because the stack puts your data right next to the address that decides where the program goes next — overflow far enough, and you're choosing that address yourself.
- **bullets:**
  - Typical stack frame order (grows toward lower addresses): local variables, saved base pointer (EBP/RBP), return address
  - Overflowing a buffer far enough overwrites the saved return address, redirecting execution when the function returns
  - Stack canaries — a known value placed before the return address — detect this kind of overwrite before the corrupted return address is ever used
  - Modern mitigations (ASLR, DEP/NX, stack canaries) mean a "naive" overflow rarely works unmodified against a hardened target — this is what pushes exploitation toward techniques like ROP
- **related:** `memory-safety-buffer-overruns`, `rop-chains-basics`, `input-validation-boundaries`

#### `rop-chains-basics` — ROP Chains Basics
- **type:** concept
- **summary:** Return-Oriented Programming chains together short, existing instruction sequences already present in a program's memory ("gadgets"), each ending in a return instruction, to construct malicious functionality without ever injecting new executable code — specifically to work around DEP/NX protections.
- **core_idea:** If you can't inject your own code because the stack isn't executable, ROP's answer is to build your attack entirely out of code the program already has, one small borrowed piece at a time.
- **bullets:**
  - A "gadget" is a short instruction sequence ending in a `ret` — the attacker chains many gadgets together by controlling what's on the stack
  - Exists specifically to bypass DEP/NX (non-executable memory) protections, since ROP never executes injected code, only existing code
  - Gadgets are typically located via automated tools that scan a binary's existing code for usable `...; ret` sequences
  - ROP can also be used to defeat ASLR indirectly, depending on what information leaks or gadgets are available within the target binary
- **related:** `buffer-overflow-stack-layout`, `memory-safety-buffer-overruns`, `spectre-meltdown-primer`

#### `spectre-meltdown-primer` — Spectre & Meltdown Primer
- **type:** concept
- **summary:** A pair of hardware-level side-channel vulnerabilities disclosed in 2018, both exploiting speculative execution — a CPU performance optimization — to leak data across security boundaries the CPU was supposed to enforce, without any software vulnerability required.
- **core_idea:** Modern CPUs guess ahead and execute instructions before they're sure they're needed for speed — Spectre and Meltdown showed that guessing wrong still leaves measurable traces an attacker can use to read data they should never have seen.
- **bullets:**
  - Meltdown exploits speculative execution to let a user-level process read kernel memory it should never be permitted to access
  - Spectre tricks a program into speculatively executing operations that leak data through observable side effects like CPU cache timing, even without directly reading forbidden memory
  - Both affect nearly all modern CPUs to varying degrees, since speculative execution is a foundational performance technique across processor architectures
  - Mitigations (kernel page table isolation, microcode updates, compiler-level fixes) have historically come with measurable performance costs, particularly for kernel-heavy workloads
- **related:** `rop-chains-basics`, `memory-safety-buffer-overruns`, `adversary-target-system-categories`

### `vulnerability-exploitation` → `exploitation-frameworks-and-scope`

#### `metasploit-autopwn-risk-and-scope` — Metasploit & Autopwn: Risk and Scope
- **type:** tool
- **summary:** Metasploit is the standard exploitation framework combining reconnaissance, exploit modules, and payload delivery in one tool — "autopwn" refers to older automated functionality that attempted exploits en masse, now understood as high-risk and generally avoided in professional engagements.
- **core_idea:** Metasploit makes running a known exploit trivial — which is exactly why professional use of it is bounded tightly by scope and rules of engagement, not by the tool's technical limits.
- **bullets:**
  - Framework structure: exploits (the vulnerability-targeting code), payloads (what runs after successful exploitation), and auxiliary modules (scanning, fuzzing)
  - Autopwn-style automated mass-exploitation is considered poor practice in professional engagements — it's noisy, imprecise, and can cause unintended system instability or outages
  - Legitimate use requires an explicit, documented scope and authorization — running Metasploit against systems outside that scope is unauthorized access, full stop
  - Meterpreter is Metasploit's advanced payload, providing an interactive, extensible post-exploitation shell rather than a bare command shell
- **related:** `privilege-escalation-paths-unpatched-software`, `command-shell-backdoors-netcat`, `penetration-test-scope-rules-of-engagement`

### `post-exploitation-persistence` → `privilege-escalation-and-backdoors`

#### `privilege-escalation-paths-unpatched-software` — Privilege Escalation via Unpatched Software
- **type:** concept
- **summary:** Outdated or unpatched software is one of the most common paths from limited access to elevated (often root/admin) privileges — known vulnerabilities in installed software, kernel components, or misconfigured services provide a documented, often automatable route upward.
- **core_idea:** Getting a low-privilege shell is rarely the hard part of a real intrusion — unpatched software is frequently what turns that shell into full control.
- **bullets:**
  - Kernel exploits targeting unpatched OS versions are a classic and often reliable privilege escalation path once initial access is achieved
  - Automated enumeration tools (checking for known-vulnerable installed package versions) speed up identifying exploitable software on a compromised host
  - SUID/SGID misconfigured binaries and cron jobs running as root are common non-exploit-based escalation paths, distinct from patching known CVEs
  - Timely patching directly closes this path — it's one of the highest-leverage, lowest-glamour defensive controls against real-world post-exploitation
- **related:** `find-permission-escalation`, `command-shell-backdoors-netcat`, `metasploit-autopwn-risk-and-scope`

#### `command-shell-backdoors-netcat` — Command Shell Backdoors & Netcat
- **type:** tool
- **summary:** Netcat is a versatile networking utility often used to establish simple command-shell backdoors — either a "bind shell" (listening on the compromised host) or a "reverse shell" (the compromised host connecting back out to the attacker).
- **core_idea:** A reverse shell exists specifically to get around the fact that most outbound connections are far less scrutinized than inbound ones — instead of attacking in, the compromised host just calls out.
- **bullets:**
  - Bind shell: the compromised host listens on a port, waiting for the attacker to connect in — often blocked by inbound firewall rules
  - Reverse shell: the compromised host initiates an outbound connection back to the attacker's listener — frequently bypasses restrictive inbound-only firewall configurations
  - Netcat's simplicity (`nc -lvp <port>` to listen, `nc <ip> <port>` to connect) makes it a common building block, though its plaintext, unauthenticated nature makes it easy for defenders to detect once looked for
  - Persistence mechanisms often pair with backdoor shells to survive reboots — scheduled tasks, cron jobs, or startup service registration
- **related:** `privilege-escalation-paths-unpatched-software`, `metasploit-autopwn-risk-and-scope`, `socket-programming-basics`

### `post-exploitation-persistence` → `deception-and-honeypots`

#### `honeypots` — Honeypots (Offensive Context)
- **type:** concept
- **summary:** In an offensive/red-team context, honeypots and decoy assets are deployed by defenders, but recognizing them matters equally to attackers, who must be aware such decoys may exist during an engagement — recognizing a honeypot avoids wasting effort or triggering high-confidence detection.
- **core_idea:** A honeypot is a trap that looks exactly like a real target — the offensive skill isn't setting the trap, it's recognizing you might be looking at one before you step in it.
- **bullets:**
  - Signs a system may be a honeypot: unusually clean/generic configuration, suspiciously easy vulnerabilities, or a lack of the "authentic mess" real production systems accumulate
  - Interacting with a honeypot as an attacker generates high-confidence, low-false-positive detection for the defending team
  - This offensive framing (recognizing/avoiding decoys during an engagement) is distinct from the defensive deployment framing covered under Detection & Monitoring's `honeypots-honeynets-padded-cell`
  - Understanding honeypot deception tactics also informs red-team tradecraft — the same principles apply to building believable decoys during adversary emulation exercises
- **related:** `honeypots-honeynets-padded-cell`, `adversarial-thinking-threat-actors`

### `offensive-wireless-attacks` → `wireless-access-attacks`

#### `wireless-evil-twin-rogue-ap` — Wireless Evil Twin & Rogue AP
- **type:** concept
- **summary:** An "evil twin" attack sets up a rogue Wi-Fi access point mimicking a legitimate network's SSID, tricking devices into connecting to it instead — giving the attacker a man-in-the-middle position over all resulting traffic.
- **core_idea:** Wi-Fi clients generally trust whichever access point answers with the right network name first — an evil twin exploits exactly that trust, without needing to break any encryption at all.
- **bullets:**
  - Devices configured to auto-connect to known SSIDs are especially vulnerable — they'll connect to a rogue AP broadcasting a familiar name without user awareness
  - Once connected, the attacker sits in the traffic path, enabling credential capture, traffic inspection, or injection — a wireless-specific man-in-the-middle
  - Captive-portal-style evil twins can present a convincing fake login page to directly harvest credentials
  - Mitigation: certificate-based enterprise Wi-Fi authentication (802.1X/EAP-TLS) rather than a shared SSID/password that's trivial to impersonate
- **related:** `wep-cracking-legacy-risk`, `wardriving-recon-exposure`, `arp-spoofing-mitm`

#### `wep-cracking-legacy-risk` — WEP Cracking & Legacy Risk
- **type:** concept
- **summary:** WEP (Wired Equivalent Privacy) is a deprecated Wi-Fi encryption standard with fundamental cryptographic weaknesses in its use of RC4 and short initialization vectors, making it crackable in minutes with widely available tools — it should not be used under any circumstance today.
- **core_idea:** WEP wasn't slowly weakened by improving attacker tooling — it was broken by design almost from the start, which is why it's treated purely as a legacy-risk case study rather than a live defensive concern.
- **bullets:**
  - WEP's short (24-bit) initialization vectors reused frequently enough to enable statistical attacks recovering the encryption key from captured traffic
  - Cracking WEP requires only capturing a sufficient volume of encrypted traffic — no brute force of the key itself is typically necessary
  - Superseded by WPA, then WPA2, then WPA3 — each addressing fundamental weaknesses in the prior standard's cryptographic design
  - Any network still using WEP today represents a critical, trivially exploitable misconfiguration, not a sophisticated attack surface
- **related:** `wireless-evil-twin-rogue-ap`, `cryptography-fundamentals`, `aes-modes-gcm-vs-cbc`

#### `wardriving-recon-exposure` — Wardriving & Recon Exposure
- **type:** concept
- **summary:** Wardriving is the practice of physically moving through an area (driving, walking) while scanning for and cataloging wireless networks — historically used both for research/mapping and as reconnaissance ahead of wireless attacks.
- **core_idea:** A wireless network's signal doesn't respect property lines — wardriving is simply taking advantage of the fact that a network's existence and rough security posture can often be observed from entirely public space.
- **bullets:**
  - Tools passively capture broadcast SSIDs, encryption type, and signal strength while moving through physical space
  - Networks still using WEP or open (unencrypted) configurations are immediately identifiable this way, without any active attack
  - Contributes to broader attack-surface mapping — identifying which physical locations have exploitable wireless exposure before any wireless attack is attempted
  - Legal status varies by jurisdiction and by what's done with discovered information — passive discovery differs meaningfully from actually attempting to connect or attack
- **related:** `wireless-evil-twin-rogue-ap`, `wep-cracking-legacy-risk`, `footprinting-reconnaissance-techniques`

#### `bluetooth-attack-families` — Bluetooth Attack Families
- **type:** concept
- **summary:** A grouping of attack types specific to Bluetooth's device-pairing and short-range communication model — including bluejacking (unsolicited messages), bluesnarfing (unauthorized data access), and exploitation of weak pairing implementations.
- **core_idea:** Bluetooth's convenience-first pairing model — designed to make connecting devices effortless — is exactly what most Bluetooth attacks exploit; the friction that would prevent abuse was traded away for ease of use.
- **bullets:**
  - Bluejacking: sending unsolicited messages/data to nearby discoverable devices — largely a nuisance rather than a serious compromise
  - Bluesnarfing: unauthorized access to data (contacts, files) on a device via Bluetooth, exploiting weak or absent authentication in the pairing implementation
  - Discoverable-mode devices are significantly more exposed — disabling discoverability when not actively pairing meaningfully reduces attack surface
  - Newer Bluetooth versions have progressively hardened pairing (e.g. stronger authentication in BLE Secure Connections), but many deployed legacy devices remain vulnerable
- **related:** `wireless-evil-twin-rogue-ap`, `adversary-target-system-categories`, `attack-surface-access-vectors`

---

## 9. Malware & Reverse Engineering

### `malware-classification-campaigns` → `malware-taxonomy-and-families`

#### `malware-taxonomy` — Malware Taxonomy
- **type:** concept
- **summary:** Malware is classified by how it behaves and propagates — viruses attach to host files and require execution, worms self-replicate across networks without user action, trojans disguise themselves as legitimate software, and ransomware encrypts data for extortion.
- **core_idea:** The name given to a piece of malware isn't just a label — it describes its propagation mechanism, which directly shapes what defense actually stops it.
- **bullets:**
  - Virus: attaches to a host file/program, requires that host to execute in order to run and spread
  - Worm: self-propagating, spreads across a network autonomously without needing a user to open anything
  - Trojan: disguises itself as legitimate or desirable software, relies entirely on deception to get initially executed
  - Ransomware: encrypts victim data and demands payment for the decryption key — often combined with data exfiltration for "double extortion"
  - Rootkits: designed specifically to hide their own presence and that of other malware from the OS and security tools
- **related:** `static-vs-dynamic-malware-analysis`, `cyber-adversary-goals-taxonomy`, `mobile-banking-trojan-case-study`

#### `mobile-banking-trojan-case-study` — Mobile Banking Trojan Case Study
- **type:** concept
- **summary:** A category of mobile malware specifically designed to intercept banking credentials and one-time passcodes, often by overlaying fake login screens on top of legitimate banking apps or abusing accessibility permissions.
- **core_idea:** Mobile banking trojans don't usually break the bank's security — they trick the phone's own OS permission model into handing them a front-row seat to everything the user types.
- **bullets:**
  - Overlay attacks: display a fake login screen indistinguishable from the real banking app, capturing credentials as the user types them
  - SMS interception: captures one-time passcodes sent via SMS, defeating SMS-based two-factor authentication specifically
  - Frequently abuse Android's Accessibility Service permissions — a legitimate feature for assistive technology, repurposed to read screen content and simulate taps
  - Distribution commonly occurs through malicious or repackaged apps outside official app stores, though some have historically evaded official store review
- **related:** `malware-taxonomy`, `adversary-target-system-categories`, `mfa-mechanisms`

### `malware-classification-campaigns` → `cyber-physical-and-disruption`

#### `cyber-physical-attack-case-studies` — Cyber-Physical Attack Case Studies
- **type:** concept
- **summary:** A category of attacks where compromising digital systems causes real-world physical consequences — targeting industrial control systems, critical infrastructure, or safety systems rather than just data.
- **core_idea:** When the target is a power grid, a water treatment plant, or an industrial controller, "just data" stops being the right frame — the actual damage happens in the physical world, not on a screen.
- **bullets:**
  - Cyber-physical attacks target OT/ICS environments specifically, where consequences include physical disruption, safety hazards, or damage — not just data loss
  - These environments often run on legacy protocols and systems never designed with security as a first-class concern, since they predate modern network connectivity assumptions
  - Detection and response for OT/ICS differs substantially from IT — availability and safety take priority even over confidentiality in many industrial contexts
  - Directly connects to the adversary target system categories established in Fundamentals — OT/ICS is treated as its own distinct target class for exactly this reason
- **related:** `adversary-target-system-categories`, `safety-critical-hazard-case-studies`, `iec-61508-sil-levels`

### `malware-analysis-methods` → `analysis-workflows`

#### `static-vs-dynamic-malware-analysis` — Static vs. Dynamic Malware Analysis
- **type:** concept
- **summary:** Static analysis examines a malware sample's code and structure without executing it — strings, disassembly, packer identification. Dynamic analysis runs the sample in a controlled, isolated environment (a sandbox) and observes its actual behavior.
- **core_idea:** Static analysis tells you what the code says it might do; dynamic analysis tells you what it actually does when it runs — and malware authors specifically design for the gap between those two answers.
- **bullets:**
  - Static techniques: string extraction, disassembly into assembly for control-flow analysis, identifying packers/obfuscation applied to the binary
  - Dynamic techniques: sandbox execution (an isolated VM) while monitoring file system changes, registry edits, and network connections (especially command-and-control traffic)
  - Self-modifying or heavily obfuscated code can defeat static analysis alone, since the "real" code only exists in memory at runtime — precisely why dynamic analysis matters
  - The two approaches are complementary rather than competing — static analysis is fast and safe first-pass triage; dynamic analysis reveals runtime behavior static analysis can't predict
- **related:** `memory-forensics-volatility`, `yara-rule-basics`, `malware-taxonomy`

#### `yara-rule-basics` — YARA Rule Basics
- **type:** tool
- **summary:** A pattern-matching tool and rule format used to identify and classify malware samples based on textual or binary patterns — YARA rules describe what makes a specific malware family recognizable, then scan files or memory to find matches.
- **core_idea:** A YARA rule is essentially a fingerprint definition — write once what makes a malware family recognizable, then that same rule can flag every future sample matching it, known or new.
- **bullets:**
  - Rules combine string patterns, hex byte sequences, and boolean condition logic to define what qualifies as a match
  - Widely used both by malware researchers classifying samples and by defenders scanning environments for known threats
  - Rules can be shared across the community similarly to how Sigma standardizes log-based detection logic — YARA is the malware/file-focused equivalent
  - Effective YARA rules balance specificity (avoiding false positives on legitimate files) against generality (still catching minor variants of the same malware family)
- **related:** `static-vs-dynamic-malware-analysis`, `sigma-detection-rules`, `malware-taxonomy`

### `threat-intelligence-attck` → `adversary-goals-and-frameworks`

#### `cyber-adversary-goals-taxonomy` — Cyber Adversary Goals Taxonomy
- **type:** concept
- **summary:** Adversaries pursue distinct end goals that shape their entire operation — financial gain, espionage, disruption, or ideological/political messaging — and understanding which goal is in play helps predict likely next steps and appropriate defensive priorities.
- **core_idea:** An attacker's ultimate goal, not just their current technique, is what predicts what they'll do next — a financially motivated actor and an espionage-focused one behave very differently even using identical initial access techniques.
- **bullets:**
  - Financial: ransomware, banking trojans, fraud — success is measured in money extracted, often prioritizing speed over stealth
  - Espionage: nation-state and APT activity focused on long-term, stealthy data collection — success is measured in sustained undetected access
  - Disruption: attacks aimed at degrading availability or causing operational damage, sometimes for political/ideological reasons rather than direct profit
  - Ideological/hacktivism: publicity and message amplification are often the actual goal, sometimes more important to the actor than technical sophistication
  - Complements, rather than replaces, the threat-actor-sophistication spectrum covered in Fundamentals — goal and skill level are separate axes
- **related:** `threat-actor-sophistication`, `mitre-attck-mapping`, `business-email-compromise-deep-dive`

#### `mitre-attck-mapping` — MITRE ATT&CK Mapping
- **type:** concept
- **summary:** MITRE ATT&CK is a globally accessible knowledge base cataloging adversary tactics and techniques based on real-world observed attacks, organized into 14 tactic categories spanning the full attack lifecycle from Reconnaissance through Impact.
- **core_idea:** ATT&CK gives defenders and analysts a shared, standardized vocabulary for describing exactly what an adversary did — instead of describing an attack in vague prose, you map it to specific, named techniques everyone in the field recognizes.
- **bullets:**
  - The 14 tactic categories, in rough lifecycle order: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, and Impact
  - Each tactic contains many specific techniques (and sub-techniques) — Persistence alone catalogs over 20 distinct techniques observed in real intrusions
  - Threat intelligence reports and detection engineering both commonly map observed or hypothesized adversary behavior directly onto ATT&CK technique IDs for consistency
  - Continuously updated based on new real-world observed adversary behavior — a living reference, not a static, fixed document
- **related:** `cyber-adversary-goals-taxonomy`, `ir-threat-hunting`, `ir-ioc-sharing`

### `fraud-and-social-malware` → `scams-and-bec`

#### `browser-lock-tech-support-scams` — Browser-Lock Tech Support Scams
- **type:** concept
- **summary:** A social engineering scam that uses a malicious or compromised webpage to lock the victim's browser with a fake, alarming warning (claiming virus infection or account compromise), pressuring them to call a fraudulent "support" number and pay for fake remediation.
- **core_idea:** These scams don't need to actually infect anything — the entire attack is psychological pressure delivered through a webpage designed to look like a genuine, urgent system failure.
- **bullets:**
  - The "lock" is typically just an aggressive JavaScript popup loop or fullscreen overlay — no actual malware infection or system compromise has occurred
  - Fake warnings mimic legitimate OS or antivirus alerts closely enough to convince less technical users the threat is real
  - The scam's monetization happens over a phone call — victims are talked into paying for unnecessary "support" or granting remote access to their machine
  - Granting remote access during the resulting phone call is where real compromise can actually occur, even though the original browser lock itself was fake
- **related:** `business-email-compromise-deep-dive`, `adversarial-thinking-threat-actors`

#### `business-email-compromise-deep-dive` — Business Email Compromise (BEC) Deep Dive
- **type:** concept
- **summary:** BEC is a scam targeting businesses and individuals involved in wire transfers or supplier payments, typically via a compromised or spoofed executive/vendor email account directing victims to redirect payments to attacker-controlled accounts. It remains one of the costliest categories of cybercrime tracked by the FBI.
- **core_idea:** BEC rarely needs any malware at all — it just needs one convincing email and a legitimate-looking reason for someone to wire money somewhere it shouldn't go.
- **bullets:**
  - The FBI's IC3 has reported billions of dollars in annual BEC losses in recent years, consistently ranking among the highest-loss cybercrime categories by total dollar amount
  - Common variants: executive impersonation (spoofed CEO requesting an urgent wire transfer), vendor email compromise (a real, compromised supplier account redirecting a legitimate invoice payment)
  - Funds are frequently routed rapidly through intermediary accounts, cryptocurrency exchanges, or peer-to-peer payment processors specifically to complicate recovery and tracing
  - Primary defenses are procedural rather than purely technical: out-of-band verification of any payment redirection request, and DMARC/SPF/DKIM to reduce email spoofing feasibility
- **related:** `email-security-dmarc-spf-dkim`, `browser-lock-tech-support-scams`, `cyber-adversary-goals-taxonomy`

---

## 10. Cryptography

**Note on this domain:** Perplexity's version of this domain used invented subdomain/topic names and several leaf IDs that don't exist in the real structure plan (it had flagged early on that it lacked the actual `STRUCTURE-PLAN.md` for later domains). Five of its leaves matched real IDs and are reused below with light editing; the other six real leaves are written fresh here.

### `cryptographic-primitives` → `algorithm-fundamentals`

#### `cryptography-fundamentals` — Cryptography Fundamentals
- **type:** concept
- **summary:** The foundational split in cryptography: symmetric (same key encrypts and decrypts, fast, needs secure key exchange) vs. asymmetric (public/private key pair, solves key distribution, slower) — plus hashing as a distinct one-way operation for integrity and verification rather than confidentiality.
- **core_idea:** Nearly every other cryptography topic is a variation or application of these three primitives — get this foundation solid and the rest becomes contextual detail.
- **bullets:**
  - Symmetric: same key both directions (AES, ChaCha20) — fast, but the key must reach both parties securely first
  - Asymmetric: a mathematically linked public/private key pair (RSA, ECC) — solves key distribution, at a real performance cost
  - Hashing: deliberately one-way (SHA-256 and similar) — used for integrity checks and password storage, not for hiding data you need back later
  - Real systems combine all three: TLS uses asymmetric crypto to exchange a symmetric session key, then symmetric crypto for bulk data, with hashing for integrity throughout
- **related:** `aes-modes-gcm-vs-cbc`, `pki-public-key-infrastructure`, `unix-password-storage-cracking`

#### `aes-modes-gcm-vs-cbc` — AES Modes: GCM vs. CBC
- **type:** concept
- **summary:** AES is a block cipher, and its "mode of operation" determines how it handles data longer than a single block. CBC (Cipher Block Chaining) provides confidentiality only and requires separate integrity protection. GCM (Galois/Counter Mode) is an authenticated-encryption mode providing confidentiality and integrity together, and is the modern default for protocols like TLS.
- **core_idea:** Successfully decrypting CBC ciphertext only tells you the math worked, not that the data is trustworthy — GCM was specifically designed so a failed integrity check refuses to hand back plaintext at all.
- **bullets:**
  - CBC: each block is XORed with the previous ciphertext block before encryption; requires a separate MAC for integrity, and is vulnerable to padding oracle attacks if that integrity layer is mishandled
  - GCM: an authenticated-encryption (AEAD) mode combining CTR-mode-style encryption with a built-in authentication tag, checking confidentiality and integrity in a single pass
  - GCM decryption failure functions as an authentication failure — it signals the receiver should not trust the plaintext at all, a safety property CBC doesn't provide by itself
  - GCM parallelizes well and generally offers higher throughput than CBC, one reason it became the default in modern protocols like TLS 1.3
  - Correct nonce/IV handling remains essential in both modes — GCM in particular is sensitive to IV reuse, which can catastrophically break its security guarantees
- **related:** `cryptography-fundamentals`, `pki-public-key-infrastructure`, `tls-handshake-cert-validation`

### `pki-and-transport-security` → `pki-certificates`

#### `pki-public-key-infrastructure` — PKI (Public Key Infrastructure)
- **type:** concept
- **summary:** The framework of certificate authorities, digital certificates, and trust chains that binds public keys to verified identities — enabling anyone to confirm a public key genuinely belongs to the entity it claims to, without having met that entity directly.
- **core_idea:** PKI solves a specific trust problem: anyone can generate a key pair claiming to be "yourbank.com" — PKI is the system of vouching that lets a stranger's browser tell the difference between the real one and an impostor.
- **bullets:**
  - A Certificate Authority (CA) digitally signs a certificate binding a public key to a verified identity, creating a chain of trust back to a trusted root CA
  - Browsers and operating systems ship with a pre-installed list of trusted root CAs — certificates chaining back to one of those roots are trusted automatically
  - Certificate revocation (via CRLs or OCSP) handles the case where a certificate needs to be invalidated before its natural expiration, such as after a private key compromise
  - X.509 is the standard certificate format underlying most real-world PKI deployments, including the certificates used in TLS
- **related:** `tls-handshake-cert-validation`, `cryptography-fundamentals`, `sso-saml-oidc-basics`

#### `tls-handshake-cert-validation` — TLS Handshake & Certificate Validation
- **type:** concept
- **summary:** The TLS handshake is the process by which a client and server agree on encryption parameters and authenticate the server's identity — specifically by validating its certificate against the PKI trust chain — before any application data is exchanged.
- **core_idea:** Every HTTPS connection starts with a negotiation, not an assumption — the handshake is where the client decides whether the server is who it claims to be, before a single byte of actual data gets sent.
- **bullets:**
  - The server presents its certificate; the client validates it against the PKI trust chain back to a trusted root CA before proceeding
  - Validation checks: signature chain to a trusted root, expiration dates, revocation status (CRL/OCSP), and that the certificate's subject matches the requested hostname
  - Asymmetric cryptography is used only during the handshake to securely establish a shared symmetric session key — the hybrid model described under cryptography fundamentals
  - TLS 1.3 streamlined the handshake compared to earlier versions, reducing round trips and removing support for older, weaker cryptographic options entirely
  - A failed certificate validation should always halt the connection — browser certificate warnings are the visible surface of this check failing
- **related:** `pki-public-key-infrastructure`, `aes-modes-gcm-vs-cbc`, `csrf-token-defense`

#### `pgp-encryption-flow` — PGP Encryption Flow
- **type:** concept
- **summary:** Pretty Good Privacy combines asymmetric and symmetric cryptography to secure email and files — encrypting the message with a one-time symmetric key, then encrypting that key with the recipient's public key, plus a separate signing step for authenticity.
- **core_idea:** PGP isn't a single algorithm — it's a workflow that chains several cryptographic primitives together to get both confidentiality and proof of who actually sent the message.
- **bullets:**
  - Encryption flow: generate a random one-time symmetric session key, encrypt the message with it, then encrypt that session key with the recipient's public key — the same hybrid pattern TLS uses
  - Signing flow (separate from encryption): hash the message, encrypt the hash with the sender's private key — the recipient verifies using the sender's public key
  - Relies on a "web of trust" model rather than centralized Certificate Authorities — users vouch for each other's key authenticity directly
  - Key management is PGP's practical weak point: losing a private key means losing access to everything ever encrypted to it, with no central recovery mechanism
- **related:** `cryptography-fundamentals`, `pki-public-key-infrastructure`

### `authentication-cryptography` → `kerberos-and-token-auth`

#### `kerberos-protocol` — Kerberos Protocol (Cryptographic Mechanics)
- **type:** concept
- **summary:** Kerberos relies entirely on symmetric-key cryptography to authenticate users and issue tickets — every ticket is encrypted with a key only the intended recipient (client or service) can decrypt, and mutual authentication is achieved through encrypted timestamps.
- **core_idea:** Kerberos never sends a password across the network after initial login — instead, it proves identity by demonstrating possession of a secret key through what only that key can correctly decrypt.
- **bullets:**
  - The user's password is used locally to derive a symmetric key — this key decrypts the initial response from the Authentication Server but is never transmitted itself
  - Tickets (TGT and service tickets) are encrypted with the secret key of the party meant to use them — a TGT is encrypted with a key known only to the Key Distribution Center
  - Mutual authentication uses encrypted timestamps: both client and server prove they can correctly encrypt/decrypt with a shared session key, confirming each other's identity
  - This entry covers the underlying cryptographic mechanics; the ticket-issuance workflow (AS/TGS/TGT roles) is covered under Identity's `kerberos-ticket-flow-as-tgs-tgt` entry — cross-linked, not duplicated
- **related:** `kerberos-ticket-flow-as-tgs-tgt`, `cryptography-fundamentals`, `aaa-access-control-model`

#### `authentication-technologies-hardware` — Authentication Technologies: Hardware
- **type:** concept
- **summary:** Hardware-based authentication factors — smart cards, TPMs, hardware security keys, and HSMs — ground authentication in physical possession of a device rather than something purely knowledge-based, making remote credential theft alone insufficient.
- **core_idea:** A password can be phished from anywhere in the world; a hardware key generally can't — hardware-based authentication trades convenience for a factor that has to be physically stolen, not just guessed or leaked.
- **bullets:**
  - Smart cards: store a private key/certificate on embedded hardware, used with a PIN as a second factor (something you have + something you know)
  - TPM (Trusted Platform Module): a hardware chip on the device itself that securely stores keys and can attest to system integrity at boot
  - Hardware security keys (FIDO2/U2F, e.g. YubiKey): phishing-resistant, since the cryptographic challenge-response is bound to the specific site's origin
  - HSMs (Hardware Security Modules): dedicated hardware for managing and using keys at scale, ensuring private keys never exist in extractable plaintext form even from privileged software
- **related:** `mfa-mechanisms`, `kerberos-protocol`, `aws-kms-key-management`

#### `unix-password-storage-cracking` — Unix Password Storage & Cracking
- **type:** concept
- **summary:** Modern password storage never stores a plaintext or reversibly-encrypted password — it stores a salted hash produced by a deliberately slow, memory-hard algorithm like bcrypt or Argon2, specifically to make offline cracking computationally expensive.
- **core_idea:** A password hash's entire job is to make verification easy for the legitimate system and brute-force guessing expensive for everyone else — that asymmetry is the whole point of algorithms like bcrypt and Argon2.
- **bullets:**
  - bcrypt: uses an adjustable "cost factor" controlling how computationally expensive each hash operation is, and embeds the salt directly in the resulting hash string
  - Argon2 (specifically Argon2id): the Password Hashing Competition winner, adds a memory-hardness parameter making GPU/ASIC-based cracking significantly more expensive than bcrypt for equivalent settings
  - Salting (a unique random value added per password before hashing) is mandatory for both algorithms — without it, precomputed rainbow-table attacks become feasible again
  - Legacy systems using fast, unsalted hashes (plain MD5, SHA-1) for passwords remain a common and serious real-world weakness, since those algorithms were never designed to resist brute-force guessing
  - Migration between algorithms is typically done incrementally — re-hashing with the new algorithm at the user's next successful login, rather than forcing a mass password reset
- **related:** `cryptography-fundamentals`, `password-attack-models-online-offline`, `password-policy-vs-passwordless`

### `authentication-cryptography` → `authentication-architecture`

#### `host-user-authentication-directions` — Host-User Authentication Directions
- **type:** concept
- **summary:** Authentication can flow in more than one direction — a user authenticating to a host is the familiar case, but a host proving its identity to a user (or to another host) matters just as much, and true mutual authentication requires both directions to succeed.
- **core_idea:** "Am I talking to who I think I am" is a question every party in a connection should be asking, not just the server checking the user.
- **bullets:**
  - User-to-host: the classic case — a user proves their identity to a server or system before being granted access
  - Host-to-user: the server proves its identity to the user — exactly what TLS certificate validation accomplishes, letting a user's browser confirm it's talking to the real site
  - Host-to-host: mutual TLS (mTLS) and Kerberos's mutual authentication both require each side to prove its identity to the other, not just one direction
  - Attacks like phishing and evil-twin Wi-Fi specifically exploit the *missing* host-to-user direction — the user has no reliable way to verify who they're actually connecting to
- **related:** `tls-handshake-cert-validation`, `kerberos-protocol`, `wireless-evil-twin-rogue-ap`

#### `implementation-failure-category` — Cryptographic Implementation Failure Categories
- **type:** concept
- **summary:** Cryptographic algorithms are rarely broken mathematically in practice — real-world crypto failures overwhelmingly come from implementation mistakes: weak randomness, protocol misuse, side-channel leakage, and outdated algorithm/mode choices.
- **core_idea:** The math behind AES or RSA is not where real systems get broken — the surrounding implementation choices are, over and over again, in the same handful of predictable ways.
- **bullets:**
  - Weak/predictable randomness: a cryptographically strong algorithm fed a weak random number generator produces predictable, breakable output
  - Protocol misuse: using a correct primitive the wrong way — e.g. reusing a nonce/IV, or using a mode of operation (ECB) that leaks data patterns
  - Side-channel leakage: information about a secret key leaking through timing, power consumption, or cache access patterns, independent of the algorithm's mathematical strength
  - Outdated algorithm/mode choices: continuing to use deprecated options (MD5, SHA-1, WEP's RC4 usage) long after they're known broken, often for legacy compatibility
- **related:** `aes-modes-gcm-vs-cbc`, `wep-cracking-legacy-risk`, `spectre-meltdown-primer`

### `data-protection-cryptography` → `data-loss-prevention`

#### `dlp-five-cs-data-protection` — DLP: The "Five Cs" of Data Protection
- **type:** concept
- **summary:** A practitioner mnemonic for structuring a Data Loss Prevention program around five recurring practices: Classify, Control, Contain, Comply, and Continuously monitor — treating DLP as an ongoing discipline rather than a single tool purchase.
- **core_idea:** DLP tooling alone doesn't prevent data loss — the "Five Cs" frame it as a continuous practice, not a one-time technical control you install and forget.
- **bullets:**
  - Classify: identify and label what data is actually sensitive before you can protect it — DLP can't protect what it hasn't been told to recognize
  - Control: enforce access restrictions and usage policies on classified data based on genuine need
  - Contain: block or restrict the specific exit paths sensitive data could leave through — email, USB, cloud upload, print
  - Comply: map data handling practices to whatever regulatory obligations apply (PCI-DSS, HIPAA, GDPR) to the data in question
  - Continuously monitor: usage patterns, exfiltration attempts, and false positives all need ongoing tuning — DLP is not "set and forget"
  - *(Note: "Five Cs" is a practitioner mnemonic rather than a single universally standardized industry term — the underlying practices are standard DLP discipline regardless of the exact label used.)*
- **related:** `data-loss-water-analogy`, `s3-public-bucket-exposure`, `compliance-drivers-by-industry`

---

## 11. Governance, Risk & Compliance

**Note on this domain:** Perplexity's version invented an entirely different structure and leaf set for this domain (same root cause as Cryptography above). One leaf, `compliance-drivers-by-industry`, matched a real ID and is reused/consolidated below; the other five real leaves are written fresh.

### `governance-frameworks` → `frameworks-overview`

#### `compliance-frameworks-overview` — Compliance Frameworks Overview
- **type:** concept
- **summary:** A high-level map of the major compliance frameworks organizations navigate — some prescriptive and industry-specific (PCI-DSS), some broader management-system standards (ISO 27001), some U.S. federal (NIST RMF/SP 800-53) — each with a different scope and enforcement mechanism.
- **core_idea:** "Compliant" only means something relative to a specific named framework — there's no such thing as being compliant in general, only compliant with a particular standard's particular requirements.
- **bullets:**
  - Prescriptive/technical standards (PCI-DSS): specific, checkable technical and procedural requirements tied to a particular data type
  - Management-system standards (ISO 27001): certify that an organization has a functioning risk-management *process*, not a fixed technical checklist
  - U.S. federal frameworks (NIST RMF, SP 800-53): control catalogs originally built for federal systems, widely adopted well beyond government
  - Overlapping obligations are the norm, not the exception — a single organization is frequently subject to several frameworks simultaneously, each audited differently
- **related:** `compliance-drivers-by-industry`, `security-control-types`, `risk-register-basics`

### `risk-management` → `risk-register-and-vendors`

#### `risk-register-basics` — Risk Register Basics
- **type:** concept
- **summary:** A structured, living document that catalogs identified risks along with their likelihood, impact, owner, and current mitigation status — the central artifact most formal risk management programs are built around.
- **core_idea:** A risk that's identified but never written down anywhere with an owner attached tends to just get forgotten until it becomes an incident.
- **bullets:**
  - Typical fields per entry: risk description, likelihood, impact, risk score, assigned owner, current mitigation status, review date
  - Serves as the shared source of truth between security teams and leadership for prioritization discussions
  - A risk register is only as useful as its review cadence — one built once and never revisited quickly becomes inaccurate
  - Feeds directly into resource allocation — the highest-scored unmitigated risks are what should be competing for budget and attention first
- **related:** `risk-threat-vulnerability-impact`, `third-party-vendor-risk`, `compliance-frameworks-overview`

#### `third-party-vendor-risk` — Third-Party & Vendor Risk
- **type:** concept
- **summary:** The risk an organization inherits from its suppliers, contractors, and service providers — since a vendor's security failure can become the organization's own incident, breach, or compliance violation.
- **core_idea:** Your security posture is only as strong as the weakest vendor with access to your systems or data — vendor risk management exists because attackers know this too.
- **bullets:**
  - Vendor risk assessment typically happens before onboarding (due diligence) and periodically afterward (ongoing monitoring), not just once
  - Common assessment inputs: security questionnaires, audit reports (e.g. SOC 2), contractual security requirements, and right-to-audit clauses
  - Supply-chain attacks specifically exploit this — compromising a trusted vendor to reach many downstream targets at once
  - Risk doesn't end at contract signing — vendor access should be reviewed and revoked promptly when a relationship or need ends
- **related:** `risk-register-basics`, `sbom-supply-chain`, `compliance-frameworks-overview`

### `regulatory-compliance` → `industry-compliance-drivers`

#### `compliance-drivers-by-industry` — Compliance Drivers by Industry
- **type:** concept
- **summary:** Different industries and data types trigger different regulatory mandates — payment card data falls under PCI DSS, healthcare data under HIPAA, EU personal data under GDPR — each imposing distinct technical obligations and enforcement timelines.
- **core_idea:** "We need to be secure" and "we need to be compliant" aren't the same requirement — compliance frameworks are specific, auditable obligations tied to a particular data type or industry, not a general security aspiration.
- **bullets:**
  - PCI DSS: applies to any organization storing, processing, or transmitting payment card data. Version 4.0's previously "future-dated" (optional) requirements became fully mandatory as of March 31, 2025 — including expanded MFA scope and continuous vulnerability scanning
  - HIPAA: applies to healthcare providers, insurers, and their business associates handling protected health information (PHI). Its Security Rule's Technical Safeguards require specific, demonstrable controls — access control, audit controls, integrity controls, transmission security
  - GDPR: applies to any organization processing personal data of EU residents, regardless of where the organization itself is based. Article 33 requires breach notification to the relevant supervisory authority within 72 hours of awareness where feasible
  - Overlapping obligations are common — a healthcare company processing EU patient payment data could simultaneously fall under all three frameworks at once
- **related:** `compliance-frameworks-overview`, `mfa-mechanisms`, `ir-regulatory-notification`

### `security-assessment-programs` → `assessment-types-and-engagement`

#### `vulnerability-assessment-vs-penetration-test` — Vulnerability Assessment vs. Penetration Test
- **type:** concept
- **summary:** Two related but distinct security assessment types — a vulnerability assessment identifies and catalogs potential weaknesses broadly, while a penetration test actively attempts to exploit them to demonstrate real-world impact.
- **core_idea:** A vulnerability assessment tells you what might be wrong; a penetration test tells you what actually happens when someone tries to abuse it.
- **bullets:**
  - Vulnerability assessment: broad, largely automated scanning to identify known weaknesses across many systems — breadth over depth
  - Penetration test: narrower in scope but deeper — a tester actively attempts to exploit identified (or discovered) weaknesses to demonstrate real impact, often chaining minor issues together
  - Vulnerability assessments typically run far more frequently (continuous or monthly); penetration tests are more resource-intensive and usually periodic (annual, or after major changes)
  - Neither replaces the other — a mature security program uses both, at different cadences and for different purposes
- **related:** `penetration-test-scope-rules-of-engagement`, `sca-dependency-scanning`, `sast-dast-overview`

#### `penetration-test-scope-rules-of-engagement` — Penetration Test Scope & Rules of Engagement
- **type:** concept
- **summary:** The formal, documented boundaries of a penetration test — what systems are in scope, what techniques are authorized, and who to contact if something goes wrong — agreed upon before any testing activity begins.
- **core_idea:** Without a signed scope and rules of engagement, the exact same technical actions that make up a legitimate penetration test are simply unauthorized computer access.
- **bullets:**
  - Scope defines precisely which systems, IP ranges, or applications are authorized for testing — anything outside that boundary is off-limits regardless of how it's discovered
  - Rules of engagement cover permitted techniques (e.g. is social engineering in scope?), testing windows, and explicit written authorization documentation
  - A designated emergency contact on both sides is standard, in case testing accidentally causes unexpected disruption
  - This authorization requirement is exactly what legally and ethically separates a penetration test from unauthorized use of the same tools and techniques
- **related:** `vulnerability-assessment-vs-penetration-test`, `metasploit-autopwn-risk-and-scope`

---

## 12. Tools

**Note on this domain:** Perplexity's version covered command-line utilities already written under Networks and Systems above, rather than the real Tools domain (SIEM/EDR/SOAR platform comparisons). All 3 leaves below are written fresh against the real structure.

### `detection-response-platforms` → `siem-platforms`

#### `siem-platform-comparison` — SIEM Platform Comparison
- **type:** tool
- **summary:** An overview of how major SIEM platforms differ in practice — deployment model, query language, and ecosystem fit — despite all serving the same core purpose of log aggregation and correlation.
- **core_idea:** The core SIEM concept — aggregate logs, correlate, alert — is the same everywhere; what actually differs between platforms is deployment model, query language, and how well each integrates with the rest of your stack.
- **bullets:**
  - Splunk: powerful, flexible SPL query language, historically on-prem-first, often the most expensive at scale
  - Elastic (ELK stack): open-source-based, highly customizable, requires more in-house engineering effort to run well
  - Microsoft Sentinel: cloud-native, tightly integrated with the Microsoft/Azure ecosystem, consumption-based pricing
  - Platform choice in practice is driven as much by existing infrastructure and team expertise as by pure feature comparison — a "better" SIEM your team can't operate well isn't actually better
- **related:** `siem-correlation-use-cases`, `log-source-prioritization`, `edr-platform-comparison`

### `detection-response-platforms` → `edr-platforms`

#### `edr-platform-comparison` — EDR Platform Comparison
- **type:** tool
- **summary:** An overview of how major EDR platforms differ in practice — detection approach, response automation depth, and ecosystem integration — while sharing the same core goal of continuous endpoint behavioral monitoring.
- **core_idea:** Nearly every EDR vendor claims the same core capability — what actually separates them is how much they automate response versus just surfacing information for an analyst to act on.
- **bullets:**
  - CrowdStrike Falcon: cloud-native, lightweight agent, strong threat-intelligence integration, widely used in enterprise environments
  - Microsoft Defender for Endpoint: deeply integrated with Windows and the broader Microsoft security ecosystem, strong value if already invested there
  - SentinelOne: emphasizes autonomous, AI-driven response with less reliance on constant analyst intervention
  - Evaluation should weigh detection accuracy and response automation depth alongside how well the platform integrates with the existing SIEM/SOAR stack, not detection capability in isolation
- **related:** `edr-vs-traditional-av`, `siem-platform-comparison`, `soar-ticketing-basics`

### `detection-response-platforms` → `soar-and-workflow`

#### `soar-ticketing-basics` — SOAR & Ticketing Basics
- **type:** tool
- **summary:** Security Orchestration, Automation, and Response platforms connect detection tools, ticketing systems, and automated playbooks together, turning a raw alert into a tracked, partially or fully automated response workflow.
- **core_idea:** SOAR's real value isn't any single automated action — it's turning "an alert appeared somewhere" into a tracked ticket with an auditable trail of exactly what was done about it and when.
- **bullets:**
  - Orchestration: connects otherwise-separate tools (SIEM, EDR, firewall, ticketing) so they can act on each other's data
  - Automation: runs predefined playbooks for common, well-understood alert types, reducing manual analyst repetition
  - Ticketing integration ensures every alert has an auditable trail — who looked at it, what was done, and when it was closed
  - Best suited to high-volume, well-understood alert types; genuinely novel or ambiguous incidents still need human judgment, not a playbook
- **related:** `siem-platform-comparison`, `alert-triage-prioritization`, `ir-preparation-runbooks`
