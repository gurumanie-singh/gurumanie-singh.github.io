# Ethics & Networking Intro

## Ethical and Legal Issues

### What is Information Assurance

- Confidentiality
- Integrity
- Availability
- Policy / Privacy

### Legal

- Different types of laws are used to protect data
  - Copyright
  - Unauthorized access
    - Ambiguous
    - Hard to prosecute
  - Theft
  - Domain specific (eg: Medical info)
- International Issues

---

- Two Types:
  - Criminal
  - Civil
- Focus on criminal option
  - Need to have “beyond a reasonable doubt”
  - Since cyber crime is new, the legal system is not up to speed
  - With newer laws there have been more prosecutions based on violation of a cyber crime
  - Hard to get juries to understand

---

- Civil Lawsuits
  - Need 50%+ to win
  - More typical in:
    - Intellectual Property issues
    - Defamation
    - Harassment
  - Hard to set damages
  - Have not seen people sue software companies
    - Bugs
    - Security
  - Possible in the future that people will sue companies for security breaches

### Ethical

- Security people typically have access to everything
- First Amendment rights
- Privacy
  - Watching what people do
  - Monitoring all traffic or monitoring down to keystrokes
    - Monitor for productivity issues
    - Defamation of character
    - Sexual Harassment

### Privacy

- Just because technology allows it, does not mean that society should.
- Technology is moving faster than the rules and regulations

## Access Methods

- Physical access to information
  - At rest
  - In motion (lost laptops, tossed data)
- 3rd party physical access to information
  - Deliberate (untrusted insider)
  - Accidental (untrained insider)
- Network access to information
  - Active (break-in)
  - Passive (watching)
  - Social (use the network to cause 3rd party access)

### Overview of Networking

- A vulnerability in an App allows an attacker to take the App offline
- Vulnerability in the OS allows the attacker to take the whole system down
- A common problem is addressing:
  - Everything that connects to the same media needs a hardware address
  - IP address is a globally unique identifier that is used in the IP layer
  - Addresses are not checked
    - Example: attacker can use any source IP address that they want

---

- Protocols
  - TCP
  - UDP
- Application Address
  - Port number that application binds to

### Ethernet

![Ethernet](./Screenshots/Ethernet.png)

### Devices

- Router
- Hub
  - Packets arrive at every computer
- Switches
  - Packet is switched on to the correct path to the destination computer

### Client / Server

- Server waits for connection from a client
  - Tell OS application an address
  - Toss packets that do not match address

![ClientServer](./Screenshots/ClientServer.png)

### Routing

- Routers have to know what their neighbors can do for them
- Routers do not know the infrastructure of the internet
- Routers have routing tables
  - These tables have the ranges of IPs that the neighbor routers know how to route
  - Based on destination address
  - Contain metrics to determine fastest route
