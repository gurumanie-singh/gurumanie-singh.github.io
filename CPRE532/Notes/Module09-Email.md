# Module 9: Email Security

---

## 9.1 — Business Email Compromise (BEC)

### Social Engineering: The Human Vector
- Estimates are that **over 60% of data loss is from Social Engineering**
- Key social engineering methods:
  - Phishing
  - Spear-Phishing
  - Email attachments (Trojans, Viruses)
  - Malicious Web Sites (Drive-by, Directed)

### What is Business Email Compromise (BEC)?
- **BEC** targets businesses; **EAC (Email Account Compromise)** targets individuals
- Methods are often the same; the difference is the victim
- Consistently one of the costliest cybercrime categories (reference: IC3 2024 Annual Report)

### How BEC Works — Two Entry Points

**1. Inserting into an Existing Relationship**
The threat actor inserts themselves into an existing relationship by:
- **Accessing a valid email account** via:
  - Password guessing
  - Phishing email to steal credentials (often the first step to a larger attack)
  - Once "valid," the attacker still needs to groom the victim before acting
- **Malware** — placed via phishing, drive-by downloads, or direct credential stealing; used to gather information
- **Video calls (new attack vector)** — attacker pretends to be part of the company and enters a meeting

**2. Starting a New Relationship**
- **Fake email address** — one-time (convince victim to give up info/money) or fake bank/impersonate your company; interactive grooming is also used
- **Phone call** — interactive; attacker uses spoofed caller ID
- **Text message** — often used to steal credentials
- **Video calls (new attack vector)** — pretend to be a member of the company and set up a call with the victim

### BEC Common Methods Summary
Everyone in an organization needs to understand:
- Data is important
- What it means to be a good data steward
- Their role in security
- Security literacy, security in context, and security made relevant

### Mitigation — Social Engineering
- **Technology**: Virus/malware scanners, email tags and scanners
- **User education**: Never underestimate the attacker's ability to fool a user
- **Processes**: Secure procedures for money transfers and email use

### Training Plan (3 Levels)
Technical measures can slow attacks, but the workforce must be trained:
1. **Cybersecurity literacy** (cyber hygiene)
2. **Hands-on cybersecurity technical training**
3. **Cyber planning exercises**

---

## 9.2 — Email Overview, Security Issues & Attacks

### Email Architecture
- **MTA (Message Transfer Agent)** — routes and delivers email between servers
- **UA (User Agent)** — the email client used by the end user
- Built on **ASCII text**, modeled after the U.S. postal system
- **Unauthenticated insertion** — anyone can inject a message
- Delivery is authenticated by location (the MTA receiving the message)

### SMTP Mail Protocol
```
Helo domain
Mail From: user
Rcpt To: user
Data     [message data]
         [end with: CR LF . CR LF]
```
- All data is in ASCII — limits data types unless encoding is used (e.g., **Base64**)

### Security Issues for Email

**No Host-to-Host Authentication**
- At best, the IP address of the sender is known — but it could be spoofed
- Example:
  ```
  Mail From:  FAKE NAME
  Rcpt To:    DEST
  ```
- Change IP packet source fields to spoof sender
- MTA typically includes the IP address from the sender, but again, it could be spoofed

**Problems with Security**
- Host-to-host authentication requires hosts to store secrets — which can be compromised
- The industry has pushed security into the **application layer** — it is up to the user to verify the email
- **Emails are in clear text** — messages are stored in clear text on both the MTA and the UA
- UAs have become more powerful and now support programming language extensions (e.g., **Microsoft Outlook with Visual Basic for Applications**)
- **UA sends passwords in clear text by default**

### Attacks on Email

| Attack | Description |
|--------|-------------|
| **Bogus Email** | Send email making the receiver think it came from someone else |
| **Compromising Email Password** | Easy since passwords are sent in clear text; may help break other passwords |
| **Deleting/Modifying Email** | Attacker guesses or sniffs a password, accesses the account, and deletes/modifies email (e.g., deleting a job offer) |
| **Melissa** | UA virus; opened by double-clicking; sent itself to the first 50 people in the address book |
| **Bubble Boy** | UA virus; user didn't need to double-click; used the preview pane to launch code |
| **Internet Worm** | MTA worm (not UA); one of the first of its kind |
| **I Love You** | Executed an actual program when opened |
| **Life Stages** | Changed its subject line as it propagated (polymorphic virus); harder to tell people what to look for |
| **My Party** | Hid the `.com` extension; double-clicking the email would launch an executable |

### Relay (MTA Relay)
- Relays are used for proper response routing
- **Relay must be authenticated** — if a spammer finds an unauthenticated relay system, they will send spam through it, masking the original sender

### POP3 / IMAP
- When checking mail, the **password is sent in clear text**
- A password sniffer is easy to implement — one packet for username, one for password
- POP3 logs in at a user-defined rate (e.g., every 2 minutes) — password is on the wire every 2 minutes
- **Backdoor issue**: Hackers can attempt to guess the password without timeouts
- **IMAP** lets you see mail on the MTA (email stays on server) — same password problems as POP3
- Secure versions of POP3 and IMAP exist but don't solve the backdoor/timeout issue

### Authentication
- Authentication has been pushed into the **user space**
- More detail covered in Module 9.3

---

## 9.3 — Email Encryption, Authentication & Filtering

### Encryption & Authentication Overview

**Proof of Sender and/or Recipient — Two Levels**
- **People**: Can you prove it is actually Alice and/or Bob?
- **Account**: Can you prove the account is valid?

**Methods for Proof**
- **End-to-end protocol** — PGP (both sender and recipient)
- **Authenticated web portal** — email drives user to portal
- **Inside domain** — Exchange, etc.
- **Sender account only** — DMARC (domain only, which implies the sender)

### PGP (Pretty Good Privacy)

**PGP Encryption Flow**
1. Sender generates a symmetric session key
2. Session key is used to encrypt the message
3. Session key is encrypted with the recipient's **public key**
4. Encrypted message + encrypted session key are sent to recipient

**PGP Decryption Flow**
1. Recipient uses their **private key** to decrypt the session key
2. Session key is used to decrypt the message

### DMARC (Domain-based Message Authentication, Reporting, and Conformance)
- An email authentication protocol that gives domain owners control over who can send email on their behalf
- Uses records stored inside **DNS**

**How DMARC Works:**
- Checks whether incoming messages pass **SPF** (IP address verification) and **DKIM** (signature-based verification)
- Checks whether those results align with the domain in the visible **"From"** address
- If a message fails these checks, DMARC tells receiving mail servers what to do:
  - **Deliver it**
  - **Send it to spam**
  - **Block/reject it entirely**

**DMARC Detailed Process:**
1. Email is received for delivery
2. Receiver checks for an existing DMARC policy for the From: domain
3. Receiver checks authentication using SPF and DKIM:
   - Checks sending IP against the SPF record
   - Validates the message using the sender's published DKIM key
4. Receiver validates DMARC alignment:
   - If SPF passes **and** the SPF domain aligns with the visible From domain → DMARC passes
   - If DKIM passes **and** the DKIM domain aligns with the visible From domain → DMARC passes
   - Otherwise, DMARC **fails**
5. If DMARC fails, receiver takes action per the domain owner's policy: do nothing, send to spam, or reject
6. Once a day, the receiver sends a **report** to the DMARC domain owner listing authentication status for all senders using that domain

### Email Filtering

**Filtering Criteria**
- Based on email addresses
- Based on domain address
- Based on malicious payload
- Action: **Block**, **Pass**, or **Modify** the email

**Spam Filter**
- Uses machine learning to decide what content is spam
- System is "trained" to recognize spam
- Spam filter marks the message as spam
- Some User Agents support spam detection and move spam to a spam folder

**Bypassing a Spam Filter**
- Keyword loading
- Misspelled keywords
- Picture only (no text for the filter to analyze)
- Picture with background words (text embedded in image)

**Filtering Lists**

| Type | Description | Weakness |
|------|-------------|----------|
| **Blacklist** | List of bad users and domains | Spammers just change domains |
| **Whitelist** | List of good users and domains | Very restrictive — hard to maintain |

**Greylist**
- Reject all email with a **temporary reject** (legitimate servers will retry; spam bots often don't)
- Maintain a whitelist not subject to filtering
- Add machines to the greylist when they resend the email (proves they're a real MTA)
- **Bypassing a greylist**: Use a real MTA to send email (spammers can do this too)

### Content Filtering

**Inbound Content Filter**
- Examines the payload for:
  - Viruses
  - Worms
  - Trojan horses
- Often based on **signatures** — requires constant signature updates

**Outbound Content Filtering**
- Used to keep private information from leaving the organization
- Monitors for: Social Security numbers, account numbers, medical records
- Actions: **log**, **stop**, or **encrypt** violating emails

**Bypassing a Content Filter**
- Encryption (encrypted viruses are harder to detect)
- Compression
