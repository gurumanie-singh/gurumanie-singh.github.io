# Module 3: Cyber-Enabled Adversary

---

## Why Adversaries Use Cyber

Cyber operations offer significant advantages over traditional physical attacks:

- **Reach & Accessibility** — operations can be conducted remotely, targeting systems anywhere in the world
- **Anonymity** — attacks are difficult to trace, reducing legal and physical risk
- **Cost Efficiency** — significant disruption can be achieved with far fewer resources than a physical operation
- **Speed** — attacks can be executed rapidly, exploiting vulnerabilities before they're patched
- **Scalability** — the same tools and tactics can target a single individual or an entire nation
- **Exploitation of Digital Dependence** — modern infrastructure (power, finance, healthcare) is deeply reliant on digital systems, making it highly vulnerable
- **Reconnaissance** — cyber enables intelligence gathering: scanning for vulnerabilities, researching employees for social engineering, and identifying valuable data

---

## How Adversaries Combine Cyber and Physical

### Cyber to Aid a Physical Attack
- **Intelligence Gathering**: Map security protocols, facility layouts, and schedules
- **Disable Security Systems**: Take down alarms, cameras, or access controls before intrusion
- **Disrupt Communications**: Prevent effective response to a physical attack
- **Manipulate OT (Operational Technology)**: Create physical vulnerabilities or distractions in industrial environments

### Cyber-Only Attacks
- Data breaches and theft
- Financial theft and fraud
- Ransomware
- Espionage
- Disruption and sabotage
- Establishing persistent long-term access
- Disinformation and manipulation

### Physical to Aid a Cyber Attack
- **Hardware Interference**: Install malware via USB drops or device tampering
- **Access to Restricted Areas**: Plug directly into a secure network port
- **Supply Chain Interception**: Intercept and modify hardware in transit to implant backdoors or surveillance tools

### Additional Considerations
- **Hybrid Attacks**: Coordinated simultaneous use of physical and cyber methods
- **Social Engineering**: Used in both domains to manipulate people
- **Supply Chain Attacks**: Compromise a supplier or third party to reach the primary target

---

## The Cyber Adversary

### Levels of Expertise
- **Script Kiddies** — use existing tools with little technical knowledge
- **Amateur** — some skill, often opportunistic
- **Professional** — skilled, targeted, well-resourced

### Methods
- Remote access
- Social engineering
- Physical access

### Organizational Structure
- Individual actor
- Cause-based group
- Loose collective (e.g., hacktivist groups)
- Criminal enterprise (organized as a business)
- State-based: state-*supported*, state-*sponsored*, or state-*run*

---

## Adversary Goals

Goals are often interrelated and frequently tied to financial gain.

### Money
Achieved through: theft (account access, redirecting funds, purchasing fraud), ransomware, and extortion.

### Data
- **Types**: PII, medical records, IP, operational/infrastructure plans
- **Threats**: Disclosure, reuse (identity theft, account access), or as a stepping stone to a larger attack
- Data can also be held hostage for ransom

### Disruption
- **Physical services**: Power grids, water, traffic, gas, building controls, medical devices
- **IT services**: 911 systems, government services, communications
- Disruption can be used as leverage (ransom) or as an end goal (terror/chaos)

### Influence
- **Personal attacks**: Swatting, fake kidnapping claims, direct threats — often demanding money
- **Public attacks**: Sole purpose is to cause fear and chaos, not necessarily financial gain

### Public Trust
- Eroding trust in governments, elected officials, public services, elections, or corporate brands

---

## How Attacks Are Executed

![Executing the Attack](./Screenshots/ExecutingTheAttack.png)

### Attacks of Opportunity
- Typically carried out by script kiddies
- Target systems that are unpatched or misconfigured (initial or reconfiguration errors)
- May use general social engineering techniques

### Advanced Persistent Threat (APT)
- Attackers select specific targets and wait patiently for a mistake — a misconfiguration or missed patch
- Alternatively, they target employees via phishing: credential theft, drive-by malware downloads, or malicious attachments
- **Likely APT Targets**: IoT infrastructure (water, power, transport), financial institutions, organizations with valuable intellectual property (agriculture, manufacturing, technology)

---

## What Attackers Target

![Examples(Target)](<./Screenshots/Examples(Target).png>)

### Vulnerable Systems
- Bad access controls
- Misconfigured systems (initial setup errors, reconfiguration errors)
- Unpatched or legacy systems
- Zero-day vulnerabilities

### Three Categories of Target Systems

| System Type | Description | Example Attack |
|-------------|-------------|----------------|
| **Data Systems** | Store critical data (IP, PII, credit cards) | Ransomware: encrypt and steal, threaten to release |
| **Process Systems** | Run essential operations (billing, inventory, medical) | Ransomware: shut down operations to demand payment |
| **Control Systems** | Manage physical assets (pipelines, power grids, traffic) | Manipulate sensor data or settings to cause physical damage |

### Vulnerable People
Over 50% of data loss stems from social engineering. Attack vectors include:
- Phishing and spear phishing emails
- Malicious email attachments
- Drive-by or directed malicious websites
- Poor access control policies

### Insiders
It is often easier to exploit a person on the inside — intentionally (recruited/coerced), accidentally (untrained), or "intentionally accidental" (social engineering tricks users into acting as unwitting accomplices).

### Vulnerable Processes
- **Internal**: Attackers gather knowledge of internal workflows to use them against the organization
- **External**: Supply chain and partner security are common weak points

---

## Real-World Examples

### Target (Retail Breach)
- Attackers gained credentials via a compromised HVAC contractor
- Installed memory-scraping malware on POS terminals (tested Nov 15–28, deployed Nov 30)
- Stole millions of credit card numbers

### Sony
- Believed to be an APT; exact entry point unclear
- One of the first attacks to cause widespread destruction of computing resources
- Well-written, highly complex malware; involved data theft and operational disruption

### Colonial Pipeline
- Ransomware attack affecting business processes and fuel distribution across the U.S. East Coast

### Florida Water Plant
- Attacker gained remote access and attempted to raise sodium hydroxide (lye) levels to dangerous concentrations

### Ukraine Power Grid
- Russian-attributed cyberattack that caused widespread power outages

### Iranian Centrifuges (Stuxnet)
- Malware manipulated sensor data to cause physical damage while reporting normal readings — also exploited process vulnerabilities

### Turkish Pipeline (2008)
- One of the earliest known cyber-physical attacks
- Gained access via internet-connected cameras, changed pipeline pressure settings, and disabled monitoring systems

### 2016 DNC Email Leak
- Spear phishing used to gain access; leaked emails influenced public opinion during a presidential election

### 2020 Twitter Bitcoin Scam
- Insiders were social-engineered into granting access to high-profile accounts to run a cryptocurrency scam