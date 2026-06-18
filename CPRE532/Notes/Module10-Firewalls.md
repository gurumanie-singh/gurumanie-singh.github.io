# Module 10: Firewalls

---

## What is a Firewall?

- Sits **between two networks**
- Analyzes packets and makes a **yes or no decision** based on a set of rules
- Firewalls can look at one single layer or at packets at **all layers** to make a decision
- The more layers the firewall examines → the **slower the throughput**
- The more rules defined in the rule set → the **lower the throughput**
- Most firewalls examine packets at all layers (APP, TCP, IP, Net) for maximum security
- Firewalls can also be used for **authentication**

---

## Types of Firewalls

### Dual-Homed Host (Most Common)
- Contains **two network cards**
- Also called **pass-through firewalls**
- Traffic passes through from one NIC to the other based on a rule set
- Each NIC has its own IP/TCP stack; rule set sits between them

### Air Gap Firewalls
- Two different applications running on the Ethernet card
- Applications communicate with each other to pass traffic
- More isolated than standard dual-homed hosts

---

## Firewall Rule Sets

- The application layer is **difficult to build rule sets for** (email, web, FTP all behave differently)
- The **default answer** to letting a packet through is **NO**
- Administrators must explicitly open specific ports for communication

---

## Application Forwarder / Application Gateway Firewall

- Acts like a **proxy**
- User must authenticate with the firewall first, then gets an open channel to the inside network

### Security Issues with Application Firewalls
- Application firewalls are usually **fully functional computers**
- Sometimes other applications run on the firewall (e.g., DNS) — this is a risk
- **Remote access to firewalls** must use strong authentication and encryption
- Remote access application can be used as a **DoS target**
- Attacks on the **operating system** running the firewall
- **Configuration issues** are a common vulnerability

---

## Screening Routers

- Most commonly look at **TCP and IP layers**
- Filter criteria:
  - **IP number**
  - **IP protocol type** (UDP, ICMP, TCP)
  - **TCP port number**
  - **Bad IP list**
- Example: Allow all SMTP (port 25) traffic
- Used in combination with a full firewall: screening router stops obviously bad traffic first, reducing load on the application firewall
- **Screening routers are merging with IDS** functionality

### Common Configuration with Screening Router + Firewall
```
[Internet] → [Screening Router (SR)] → [Firewall (FW)] → [Internal Network]
```
- SR has a "Good List" and "Bad List"
- Provides two layers of defense — fast filtering first, then deep inspection

---

## Firewall Physical Security

- Crucial to security — needs **both physical protection and software protection**
- Common configurations vary by organization
- **Remote connections** that configure the firewall must be secured as well

---

## Multiple Firewall Configurations (DMZ)

For added security, businesses typically implement **multiple firewalls**:

```
[Internet] → [FW loose rules] → [DMZ Network: Mail Hub, Web, FTP] → [FW strict rules] → [Internal Network]
```

- Hosts in the DMZ network (between the two firewalls) are called **"sacrificial hosts"** — they are not behind the strict firewall
- Also includes: **Logging**, **IDS**, and **NAT** in the DMZ zone

---

## Proxies

- Some applications need real-time data transfers and **cannot achieve store-and-forward** — this type of data must **"tunnel" through** the firewall
- Common for organizations to put **web proxies** in firewalls — a single point of data collection for all web traffic
- **Proxies are great for logging**

```
[Internal net] → [Proxy] → [FW web only] → [Internet]
```

---

## Firewall Attack Vectors

Two main points of attack against firewalls:

1. **Break the firewall itself** — exploit vulnerabilities in the firewall software or OS
2. **Break the protocol of the firewall and piggyback on allowed traffic**:
   - Take ownership of a web server, then use **port 80** to pass traffic to other hosts on the internal network
   - Usually accomplished via a **virus or Trojan horse**

---

## Personal Firewalls

- Attempt to block traffic at **individual computers**
- Uses simple methods — blocks on **ports and IP addresses**
- Operates like a screening router
- Built into most operating systems (e.g., Windows Firewall)
- Examples:
  - **ZoneAlarm**: https://www.zonealarm.com/software/free-firewall

---

## Application Firewalls

- Integrated **into an application**
- Web is the most common use case
- Example: Web Application Firewalls (WAF) — studied in the web module

---

## Freeware Firewalls

- Built into most home access devices (routers)
- **pfSense**: https://www.pfsense.org/
- **OPNsense**: https://opnsense.org/
- Personal FW built into most OS
- **ZoneAlarm**: https://www.zonealarm.com/software/free-firewall
