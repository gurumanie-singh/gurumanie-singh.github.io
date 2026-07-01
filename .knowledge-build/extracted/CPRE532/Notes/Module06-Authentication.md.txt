# Module 6: Authentication

---

## 6.1 — Identity & Authentication Fundamentals

### Identity vs. Authentication

- **Identity** — the individual characteristics by which a person or thing is recognized
- **Digital Identity** — the electronic representation of a real-world entity (person, organization, or device) that participates in electronic transactions; raises complex questions around privacy, ownership, and security
- **Authentication** — the process of *validating* that identity; it is the first step in any identity management system

### The Four Types of Authentication

| Type | Description | Example |
|------|-------------|---------|
| **User → Host** | Person proves identity to a computer resource | Logging into a system (most common) |
| **Host → Host** | Machine-to-machine identity verification | Historically done via IP address (weak) |
| **User → User** | Verifying identity between two people | Secure email, online contracts, auctions |
| **Host → User** | Server authenticates itself to a user | HTTPS certificates |

### Three Factors of User-to-Host Authentication

- **Something you are** — biometrics (fingerprints, voice prints, thermal imaging, DNA); raises privacy concerns and scalability challenges
- **Something you know** — passwords and PINs; most common but limited by human memory
- **Something you have** — key cards, ATM cards; convenient but can be lost or stolen

---

## Passwords

### Static vs. One-Time

- **Static passwords** remain valid until the user changes them; stored using one-way (hashing) algorithms — never in plaintext
- **One-time passwords (OTP)** are used once and then invalidated

### Password Attacks

- **Password guessing** — exploits users' tendency to choose weak, predictable passwords; can be aided by social engineering
- **Password cracking (offline)** — attacker obtains the password file/database and runs cracking tools against it

### UNIX Password Storage

- Traditionally stored in `/etc/passwd` in the format: `username:password:uid:gid:info:home:shell`
- Passwords are stored as a salted one-way hash (password + salt → 11-character hash); the system never decrypts — it re-hashes the input and compares
- `/etc/passwd` must be world-readable, so any valid user can grab it — misconfigured services (e.g., anonymous FTP) can leak it externally

**Cracking tools** (e.g., John the Ripper, Crack) work by:
- Using the info field and common variations
- Running words from dictionaries
- Trying permutations: capitalization, substitutions (`1→l`, `3→e`, `@→a`), international words, short word pairings

*1990 study: of 13,797 encrypted passwords — 3% broken in 15 min, 21% in one CPU-week, 25% in one CPU-year.*

**Defense — Shadow Passwords**: Split the password file so only `username:uid:gid` is world-readable; the actual password hash lives in a separate file (`/etc/shadow`) readable only by root.

---

## Authentication Technologies

### Key Cards
- PIN-activated; use asynchronous (challenge/response) or synchronous (time-based) methods
- Time-based cards require the host to accept a small window of valid responses
- Typically allow 3 attempts before lockout

### Smart Cards
- Physical card with a direct interface (inserted into reader)
- Authenticated by PIN or fingerprint; can store large amounts of data
- Generally considered more secure than key cards

### One-Time Passwords (S/Key)
- Designed by Bell Labs for travelers outside the security of a corporate environment
- Based on a **one-way hash chain**:
  - Generate a sequence (e.g., 100 keys): `P1 = hash(password)`, `P2 = hash(P1)`, `P3 = hash(P2)`...
  - Only the *last* key in the chain is stored on the server
  - User authenticates by providing keys in reverse order; each is verified against the stored value, then replaced
- Much more secure than static passwords since each key is used only once

---

## Host-to-Host Authentication

Many security systems (firewalls, IDS, backup systems, file system mounting) rely on host authentication. Methods ranked from weakest to strongest:

1. **No authentication / IP address or hostname** — trivially spoofed; not real authentication
2. **Password-based** — only marginally better
3. **Digital signatures + encryption + trusted third party** — the recommended approach

---

## User-to-User & Host-to-User

- **User-to-User**: Relies on digital signatures and public key cryptography (covered more in the application layer)
- **Host-to-User**: Relies on digital certificates (e.g., HTTPS), digital signatures (common in software distribution), and public key encryption — always requires a trusted source somewhere in the chain

---

## 6.2 — Kerberos

### Overview

Developed at MIT under Project Athena. Kerberos is a trusted third-party authentication system designed to exchange session keys without ever transmitting plaintext passwords. Currently at **Version 5**.

**Design Goals:**
- No plaintext passwords sent over the network
- No plaintext passwords stored on the KDC (Key Distribution Center)
- Passwords kept in memory for as short a time as possible
- Compromise of one user is limited to that session
- Tickets have a finite lifetime
- Transparent to the end user
- Minimal changes required to applications

### Key Definitions

- **Principal** — any participant in Kerberos (user, client program, or server); identified by: `primary_name.instance@REALM` (e.g., `jones@IASTATE.EDU`)
- **Realm** — the administrative domain (e.g., `IASTATE.EDU`)
- **Instance** — usually null; can specify elevated roles (e.g., `root`, `admin`)

### Kerberos Server Components

- **AS (Authentication Server)** — holds the user database and authentication info; issues Ticket Granting Tickets (TGTs)
- **TGS (Ticket Granting Server)** — hands out service tickets based on a valid TGT; tickets authorize access to specific resources

### Authentication Flow (Simplified)
1. User authenticates to the AS and receives a **TGT**
2. User presents the TGT to the TGS to request a **service ticket**
3. User presents the service ticket to the target application/server to gain access

---

## 6.3 — Cryptography & PKI

### Active Directory and Kerberos
Active Directory uses Kerberos to issue two tickets — a **TGT** and a **Session Ticket** — and uses an X.500-style directory service to manage user and application information post-authentication.

### Cryptographic Systems

| Type | How It Works | Examples |
|------|-------------|---------|
| **Symmetric Key** | One key for both encryption and decryption | DES, AES, IDEA |
| **Public Key (Asymmetric)** | A matched key pair — public and private; either can encrypt, but only the other can decrypt | RSA |
| **Hash Function** | One-way; maps n bytes → fixed-size output; used for integrity and password storage | MD5, SHA |

### Key Distribution

- **Symmetric**: Physical distribution, or use an existing key to deliver the new one (doesn't scale), or use a trusted third party (Kerberos)
- **Public Key**: Publish the public key broadly; manage via PKI

### Issues with Cryptography
- Key distribution and protection
- Denial of service against the crypto system
- Employee access control to the cryptosystem
- Poor key selection by users

---

## PKI (Public Key Infrastructure)

PKI distributes and manages public keys, binding each public key to the owner of the corresponding private key. Often described as **50% technology, 50% bureaucracy** — global interoperability is difficult.

### Components

- **CA (Certificate Authority)** — the trusted third party; issues and revokes certificates; maintains a Certificate Revocation List (CRL); signs certificates so tampering is detectable. *If the CA is compromised, nothing in the chain can be trusted.*
- **RA (Registration Authority)** — vouches for users and verifies their identity before passing them to the CA; handles billing and administration

### Certificates (X.509 Standard)

A certificate contains:
- Subject name and public key
- Issuing CA and validity period (Not Before / Not After)
- Serial number and version
- Hash algorithm (certificates are designed to be algorithm-independent)
- CA and Subject IDs (unique identifiers)
- Digital signature: the hash of the certificate encrypted with the CA's private key
- Extensions

*Note: Certificate contents are not encrypted — they are signed for integrity, not confidentiality.*

### Trust Models

- **Hierarchical (Root CA model)**: A root CA sits at the top with subordinate CAs below — similar in structure to DNS. IPRA (Internet Policy Registration Authority) governs at the top level. Different certificate classes exist (anonymous/residential, organizational).
- **Web of Trust** (PGP model): Decentralized — trust is transitive. If John trusts Joe, and Joe trusts Mary, John can trust Mary's certificate.
- **Cross-Certification**: CAs build direct trust with each other without depending on a shared root.

---

## 6.4 — Common Attacks & Mitigations

### The Authentication Collapse Chain
A single compromised secret can cascade: **Compromise Secret → Forge Identity → Gain Authorization → Move Laterally → Establish Persistence**

---

### Failure Category 1: Secret-Level Failures
The secret *becomes* the identity — weak or exposed credentials collapse everything.

| Attack | Description |
|--------|-------------|
| **Brute Force / Online Guessing** | Weak passwords with no rate limiting or lockout |
| **Dictionary & Hybrid Attacks** | Wordlists + substitutions; GPU-accelerated offline cracking |
| **Password Spraying** | One password tried across many accounts to avoid per-account lockout |
| **Credential Stuffing** | Automated reuse of credentials from known breaches |
| **Offline Hash Cracking** | Stolen password file cracked offline — no lockout, time-memory tradeoffs |
| **Pass-the-Hash** | Reuse of a captured NTLM hash for lateral movement without knowing the plaintext password |

**Mitigations**: Long passwords over complex ones, slow salted hashing, MFA, password managers

---

### Failure Category 2: Protocol-Level Failures
The math is sound — but design assumptions fail.

| Attack | Description |
|--------|-------------|
| **Replay Attack** | Capture and resend an authentication message; exploits weak freshness guarantees |
| **Kerberoasting** | Request a service ticket, extract the encrypted hash, crack it offline |
| **Golden Ticket** | Compromise the KRBTGT account to forge TGTs — enables domain-wide persistence |
| **Protocol Downgrade** | Force use of a weaker protocol (e.g., legacy NTLM fallback) |
| **OAuth Token Abuse** | Steal or persist access/refresh tokens |

**Mitigations**: Short ticket/token lifetimes, disable legacy protocols, strong service account passwords, token binding

---

### Failure Category 3: Implementation Failures
Secure protocol, insecure deployment — configuration errors dominate real-world breaches.

- Misconfigured TLS (weak cipher suites, improper certificate validation)
- Overprivileged service accounts with poor password hygiene
- Long-lived tokens that amplify persistence

**Mitigations**: Configuration audits, least privilege, hardened defaults, continuous validation

---

### Failure Category 4: Infrastructure & Trust Model Failures
Authentication depends on trust chains — expanding trust expands risk.

- CA private key compromise collapses trust across the entire ecosystem
- Implicit trust based on IP addresses (network-based identity)
- Overprivileged service accounts

**Response — Zero Trust**: Identity-based access control with continuous validation; assume breach at all times.

---

### Failure Category 5: Human & Governance Failures
Humans override cryptography — policy gaps undermine technical controls.

| Attack | Description |
|--------|-------------|
| **Phishing** | Credential harvesting or OAuth abuse via deceptive messages |
| **MFA Fatigue** | Repeated push notifications until the user approves out of frustration |
| **Help Desk Social Engineering** | Impersonate an executive or user to trigger a password reset |

**Mitigations**: Phishing-resistant MFA (FIDO2/passkeys), strict verification protocols, security awareness culture

---

### Failure Category 6: Monitoring & Detection Failures
Authentication may be breached but go entirely undetected — detection completes the defense loop.

**Key detection indicators:**
- Impossible travel (login from two distant locations in a short time)
- Abnormal Ticket Granting Service (TGS) requests
- Excessive or unusual MFA prompts
- Ticket lifetime anomalies

---

## Authentication Maturity Model

| Level | Approach |
|-------|----------|
| 1 | Password only |
| 2 | Multi-factor authentication (MFA) |
| 3 | Phishing-resistant MFA |
| 4 | Zero Trust architecture |
| 5 | Continuous authentication |

---

## Key Takeaways

- **Authentication fails structurally, not cryptographically** — cryptography itself rarely breaks; trust assumptions and human behavior do
- Most real attacks exploit the boundaries *between* failure categories
- Compromising authentication enables lateral movement and persistence
- Resilience requires layered controls *and* active detection
- Authentication is a strategic target — treat it as one