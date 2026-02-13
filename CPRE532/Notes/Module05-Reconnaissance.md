# Reconnaissance

## Footprinting

Footprinting builds profile of target

- People information
- Backdoor information
- Network
- Analogous to casing a bank

### Information

- Internet
  - Domain name
  - Network addresses
  - Topology of target network
- Intranet
  - Obtain technology used
  - VPNs
  - Remote access
- Extranet
  - Access control that the target uses

### Steps

- Check web site
  - Possible to download entire web site
  - Can obtain
    - Location
    - Related sites
    - Merger and acquisition
    - Contact information
    - Privacy policies
      - Use policy to infer what security is in place
    - Comments in html source
- Newsgroups
  - Look for posting from the target’s IT team
- Tools
  - FerretPro
    - Advanced searching, Newsgroups, IRC, etc..
  - AltaVista or other search engines
    - “Link: www.issl.org”, this search will find any web page that links to issl.org
    - Used to find backdoors
    - Employees usually link back to the company they work for, build employee list
- Public Databases
  - State and local government databases
  - Gather information on partnerships or subsidiaries, looking for trust relationship to exploit
- DNS (Domain Name Service)
  - Registration information
  - Use whois searches and domain query
    - Finds organizational information
    - Address of register
    - Admin contact
    - DNS server
    - NSlookup will query DNS for IP address of target
    - Domain table transfers (usually blocked)
      - ls –d acme.net >> file
    - Tools for DNS
      - Sam Spade whois lookup and zone transfers
- Network query
  - Ask what networks belong to target’s name
- Point of contact
  - List of names
  - Social engineering targets
- Trace route
  - Unix program, in Nt called tracert
  - Figures out the various machines along the path from attacker to target
  - Uses time to live field
    - The device that decreases the time to live field to zero sends a packet back to originator telling who killed the packet
  - Visual Route is a graphical trace route, shows geography
    - Graphical helpful for denial of service attack
- UDP
  - Mostly blocked
  - Port 53 is usually open for UDP, DNS service runs on port 53

## Intro to Scanning

### Header Attacks

- Creation of invalid packets, different protocols handle bad packets differently
- Source and destination address manipulation
- Device can be confused by setting source and destination to the same address
- Setting bits in the header that should not be set
- Putting values in the header that are above or below the level specified in the standard

### Protocol Attacks

- You can shutdown the protocol itself
- Send packets telling the device to stop talking
- For connectionless protocols you can answer as the server and tell the client the server is down.
- Ex: Syn flood

#### Network Protocol Issues

- Timing / procedural
  - Who talks first, who says what and when
  - Think of a phone call conversations, there is a protocol, the person picking up the phone talks first
  - Attacks usually involve valid packets that are out of order, arrive too fast, or are missing packets

### Authentication Attacks

- Authentication is the proof of one’s identity to another.
- Often thought of as username & password based
- In a network addresses are often used to authenticate packets.
  - Like the 4 addresses used to identify a packet in the Internet

### Traffic Attacks

- Too much data
  - To a single:
    - Application
    - Network device
    - Protocol layer
  - From:
    - Multiple machines
    - Single attackers
- Traffic Capture (sniffing)
- You can shutdown a service by:
  - flooding it with packets
  - opening a large number of connections
- You can shutdown network by:
  - flooding it with a large number of packets.
  - Broadcast packets will do the most damage
- You can shutdown a machine by:
  - flooding a machine with packets on multiple services
  - Broadcast storms

Traffic Capture:

- Packet sniffing can be played out against any layer in the network if the attacker is in a position to “see” the traffic.

### Application Attacks

- TCP stream Service
- Socket Layer
- Common Attack Methods

## Scanning

- Footprinting has identified some targets
- Scanning will tell one if there are vulnerabilities
- Scanning can be detected
- Talk about countermeasures to these detection methods
- Ping
  - Dos prompt has access to ping
  - All UNIX variants have ping
  - Uses ICMP
    - Used to report errors in IP layer
    - Carried as payload in an IP packet
    - Part of kernel code
  - ICMP echo
  - ICMP echo reply
  - Both used to support ping

### Ping

- Send echo request
- Echo reply is sent back
- Tells if a computer is alive and TCP/IP stack is in operation
- Ping sweeps
  - Sweep through IP addresses to see what IPs are returning with echo reply
  - Iowa State has a possible 65,000 possible addresses, would take long time to ping if one waited for a response to each ping
  - Fping, UNIX, sends out multiple pings and doesn’t wait for the answer to come back
  - Windows has Pinger
  - Administrators might block echo requests

### TCP Ping

- Checks if a particular port is open
- Usually use port 80
- Firewalls typically allow port 80 to pass
- Other ports
  - 25 mail
  - 110 pop
  - 143 Imap

### ICMPenum

- Allows a user to pick ICMP packet to use
- ICMP time stamp
- Using obscure ICMP messages to tell if a computer lives at the IP address

### Detection

- Need a device that watches all traffic to determine ping sweeps
- Intrusion detection can detect
- Snort is a free IDS
- Most common ones are like virus scanners, use signatures
- Can get past IDS by changing signature of scan
- Typical rule of IDS if (icmp; =icmp++) or if walking through IPs linearly then problem
- Attacker changes scanner to randomly select IPs in subnet so that they are not scanned linearly
- Very simple example

### Prevention

- Block ICMP
  - Some ICMP messages are essential to network
  - Usually allow (incoming only, never respond to)
    - Echo reply
    - Host unreachable
    - Time exceeded
  - Remove ICMP from kernel and put in user defined space, UNIX only

---

SCANNING PHASE 1 COMPLETE

---

### Services Offered

- TCP/IP protocol suite
  - 65k ports for TCP and 65k for UDP ports
- How does an attacker find out what ports a server opens for communication
  - Try TCP connections to all ports
    - Example: Use telnet to try to open all ports and see if target responds
  - TCP connection, 3 way handshaking
    - Client sends SYN
    - Server responds with Syn/Ack
    - Client Acks
  - This completed connection gets logged
  - Attackers got more intelligent and devised the half open scan
    - Attacker sends Syn
    - Server responds with Syn/Ack
    - Attacker sends Rst/Ack
  - This is not a complete connection so it would not have been logged
  - TCP Fin
    - If a FIN comes to a close port, a RST must be sent back
    - Attackers use the TCP/IP standard to send a RST packet as a way of telling if a port is closed, if a port doesn’t send this back then it must be open
- TCP Null scan
  - No flags are set, closed ports would send back a RST
- TCP Ack scan
  - Takes advantage of poorly configured firewalls
  - Some firewalls filter the opening of connections by looking at the Syn and the Syn/Ack packets
  - Assumption that is made:
    - the firewalls do not care about other packets because they stopped all bad connections
  - Ack will go through because firewall thinks the connection has been allowed
  - Statefull firewalls block this type of scan

### UDP for Scanning

- UDP is stateless
- Send UDP packet to port
- Port responds with ICMP message with host unreachable
- Minimal use of UDP scans because most firewalls block this access, UDP not used by many applications

## Tools for Scanning

- Strobe
  - TCP port scanner
- UDP scan
- Netcat or Nc
  - Robust scanning tools, has many uses
- Nmap
  - Insecure.org is the homepage
  - List services that are available
  - Makes guesses on operation system running on target computer by active stack fingerprinting
  - Allows spoofing of packets
- Ident UNIX
  - Determines the user of an connection, used as a reverse authentication product
- NetScan Tools – Windows
- Super Scan - Windows

### Countermeasures

- Personal firewalls
- IDS
- Unix utilities
- Massive port scans are easy to detect
- Limit services offered on system
  - Usually limits usefulness of computer

### Determining OS

- Try Telnet and FTP and read the banners
- Active stack finger printing
  - Fin probe, send fin to open port, this fin is an invalid packet, TCP/IP standard tells the OS manufacturers not to respond, some Operating Systems do
  - Bogus flag in Syn packet, different OS respond differently
  - Initial sequence numbers are picked differently
  - Don’t fragment bit
  - Initial TCP/IP window size
  - ICMP differences
    - Header return
    - Message return rate
  - Not looking for flaws or vulnerabilities, looking for TCP/IP stack implementation differences and from these differences determine OS

### NMAP

- Nmap –sp IP address / Cidr for ping sweeps
- CIDR is way to specify IPs
- IP address is 4, 8 bit chunks
- Example 129.186.215.0
- Basically telling where the network and hosts are defined in the IP address

### Determining Operating System

- Type of Service field, some stacks give back non-zero values
- Fragmentation issues
  - Overlapping fragments
- TCP options
  - Send packets with options defined, new options continue to be defined

### Tools and Passive Fingerprinting

- Nmap
  - Doesn’t do fragment test but does most of these determining techniques
  - Nmap –o IP
- Cheops
  - Draws picture of network
- Passive finger printing
  - More difficult
  - Monitor the network with sniffer
  - Look for
    - TTL
    - Window size
    - Fragment
