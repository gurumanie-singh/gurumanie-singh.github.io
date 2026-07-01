# Module 5: Reconnaissance, Scanning & Enumeration

---

## 1. Footprinting

Footprinting is the process of building a profile of a target before an attack — analogous to casing a bank. It targets three areas:

- **Internet**: Domain names, network addresses, network topology
- **Intranet**: Technologies in use, VPNs, remote access methods
- **Extranet**: Access controls used by the target

### Techniques

**Website Analysis**
- Download entire website to analyze offline
- Gather location, related sites, M&A activity, contact info, and privacy policies (which can hint at security practices)
- Review HTML source for comments left by developers

**Newsgroups & Social Engineering**
- Search for posts from the target's IT staff
- Build employee lists by finding pages that link back to the company (e.g., `link:www.company.com` in search engines)

**Public Databases**
- State/local government databases for partnerships or subsidiaries
- Useful for finding trust relationships to exploit

**DNS Enumeration**
- `whois` lookups reveal: organization info, admin contacts, DNS servers, and registrar address
- `nslookup` queries DNS for IP addresses
- Zone transfers (`ls -d acme.net >> file`) can expose the full domain table — usually blocked
- Tools: **Sam Spade** (whois + zone transfers)

**Network Mapping**
- Query which networks belong to a target's organization name
- **Traceroute** (`tracert` on Windows) maps the path from attacker to target using the TTL field — each hop that drops TTL to 0 responds with its identity
- **Visual Route** provides a graphical/geographic view, useful for planning DoS attacks
- Port 53 UDP is commonly open (DNS); most other UDP ports are blocked

**Tools**
- **FerretPro**: Advanced searching, newsgroups, IRC
- **AltaVista / search engines**: Link searches, employee discovery

---

## 2. Scanning

Once footprinting identifies targets, scanning determines whether vulnerabilities exist. Scanning can be detected, so attackers use various countermeasures.

### ICMP / Ping Techniques

- **Ping**: Uses ICMP echo request/reply to confirm a host is alive and the TCP/IP stack is running
- **Ping Sweep**: Sends pings across a range of IPs to find live hosts
  - `fping` (Unix): sends multiple pings without waiting for replies
  - Windows equivalent: **Pinger**
- **TCP Ping**: Tests if a specific port is open (commonly port 80, which firewalls typically allow); also ports 25 (SMTP), 110 (POP), 143 (IMAP)
- **ICMPenum**: Lets the attacker choose specific ICMP message types (e.g., timestamp) to probe hosts using obscure packets that might bypass filters

### IDS Detection & Evasion

- **Snort** is a common free IDS; most IDS tools use signatures (similar to antivirus)
- Typical IDS rule: flag if ICMP count increases or if IPs are scanned linearly
- **Evasion**: Randomize the order of scanned IPs to avoid linear-scan signatures

### Prevention
- Block ICMP at the firewall (with care — some ICMP types are essential)
- Recommended to allow **incoming only** (never respond to): Echo Reply, Host Unreachable, Time Exceeded
- On Unix: move ICMP from kernel to user space for finer control

---

## 3. Port Scanning

TCP/IP supports 65,535 TCP ports and 65,535 UDP ports. Port scanning identifies which are open.

### TCP Scan Types

| Scan Type | How It Works | Notes |
|-----------|-------------|-------|
| **Full Connect** | Complete 3-way handshake (SYN → SYN/ACK → ACK) | Logged by target |
| **Half-Open (SYN)** | SYN → SYN/ACK → RST/ACK (never completes) | Not logged as a full connection |
| **FIN Scan** | Sends FIN to a port; closed ports reply with RST | Open ports do not reply (per RFC) |
| **Null Scan** | No flags set; closed ports reply with RST | Open ports are silent |
| **ACK Scan** | Exploits stateless firewalls that only filter SYN/SYN-ACK | Stateful firewalls block this |

### UDP Scanning
- Send a UDP packet to a port; closed ports reply with ICMP "host unreachable"
- Rarely used — most firewalls block UDP, and few apps use it

---

## 4. OS Fingerprinting

### Active Fingerprinting
Probes the target to infer the OS from TCP/IP stack behavior differences:
- Response to a FIN sent to an open port (some OSes respond when they shouldn't)
- Bogus flags in SYN packets
- Initial sequence number patterns
- Don't Fragment (DF) bit behavior
- Initial TCP window size
- ICMP header/message return behavior

### Passive Fingerprinting
Sniff traffic without sending probes — look for TTL, window size, and fragmentation behavior.

### Banners
Telnet or FTP to a service and read the banner — often reveals OS and software version.

### Tools
- **Nmap** (`nmap -O <IP>`): Active fingerprinting, ping sweeps (`nmap -sP <IP/CIDR>`), supports packet spoofing
- **Cheops**: Draws a graphical map of the network
- **NetScan Tools**, **Super Scan**: Windows-based scanners
- **Strobe**, **Netcat (nc)**: TCP port scanners; Netcat is highly versatile
- **Ident (Unix)**: Identifies the user behind a connection (reverse authentication)

### Countermeasures
- Personal firewalls and IDS
- Limit services running on systems (reduces attack surface)
- Massive port scans are easy to detect

---

## 5. Enumeration

Enumeration goes deeper than scanning — it extracts specific information from identified systems. It is heavily OS-dependent.

**What it looks for:**
- Shared network resources
- Usernames and group memberships
- Application banners
- SNMP and DNS data
- Machine names, routing tables
- Active Directory or other authentication systems

### Windows Enumeration

**Null Sessions & NetBIOS**
- A null session is an unauthenticated connection to a Windows share that can expose user lists, share names, and network info
- Block Windows file-sharing ports (NetBIOS) at the firewall
- `net view`: Lists domain shares
- `nbtstat`: Queries machines for NetBIOS names, logged-in user, and MAC address

**Domain Controller Tools**
- **DumpSec**: Extracts share and user info from domain controllers
- **Legion**: Scans an IP range for shares, displays them as a tree, and attempts dictionary attacks

**Windows Services**
- DHCP: Standard implementation
- DNS: Watch for zone transfer vulnerabilities

### SNMP (Simple Network Management Protocol)
- Port 161; used to query routers, bridges, and gateways
- Can expose: device type, administrator info, shares, usernames, domain names
- "SNMP walking" tools can enumerate entire networks

### Unix Enumeration
- **NFS (Network File System)**: Can be queried for shares; sometimes exposes the password file
- **Finger** (`finger 0@host`): Shows logged-in users, real names, and user IDs; `rwho` shows remote logins
- **Samba**: Allows Unix machines to interact with Windows shares
- **TFTP**: Unauthenticated file transfer — often a data leak risk
- **RPC / Portmapper**: Exposes remote services; Nmap works well here
- **SMTP VRFY** (port 25): Can verify if a username exists (usually disabled)

---

## 6. Header & Protocol Attacks (Overview)

### Header Attacks
- Crafting invalid packets to confuse protocol stacks
- Setting source and destination to the same address
- Setting reserved/illegal header bits
- Values outside the range defined by the standard

### Protocol Attacks
- Sending packets that instruct a device to stop communicating
- For connectionless protocols: spoof a "server is down" response to the client
- **Example**: SYN flood — overwhelms a server by sending many SYN packets without completing the handshake

### Network Timing Attacks
- Valid packets that arrive out of order, too fast, or are deliberately missing

### Authentication Attacks
- Network addresses are often used to authenticate packets (the 4-tuple IP header)
- Exploiting IP-based trust rather than credential-based auth

### Traffic Attacks
- **Flooding**: Too many packets to a single app, device, or protocol layer — can come from one attacker or many (DDoS)
- **Broadcast storms**: Broadcast packets amplify damage across the network
- **Sniffing**: Capture traffic at any layer if the attacker can see it; exploits shared network segments