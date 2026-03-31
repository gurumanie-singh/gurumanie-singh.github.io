# Network Layer

## Name and Address

- DNS name in ASCII string: (dns)
  - www.uni.edu
- IP address in dotted-decimal ASCII string (dd):
  - 134.161.7.207
- IP address in 32-bit binary representation (b):
  - 10000110 10100001 00000111 11001111
- Difference between a DNS name and an IP address
  - Names are meaningful, easy to remember
    - Variable-length, difficult for router to process
  - Addresses have fixed length, rigid hierarchical structure
    - Easy for router to process

## Address Resolution Protocol (ARP)

- ARP allows a host to find the MAC address of a target host on the same physical network, given the target host’s IP address

[ARP](./Screenshots/ARP.png)

## Dynamic Host Configuration Protocol (DHCP)

- BOOTP allows a diskless workstation to be remotely booted up in a network
  - Well-known UDP ports 67 (server) & 68 (client)
- DHCP builds on BOOTP to allow servers to deliver configuration information to a host
  - Used extensively to assign temporary IP addresses to hosts
  - Allows ISP to maximize usage of their limited IP addresses
- DHCPv6 for IPv6
  - UDP ports 547 (server) & 546 (client)

## DHCP Operation

- Host broadcasts DHCP Discover message on its physical network
- Servers reply with DHCP Offer messages:
  - (IP Address + Configuration Information)
- Host selects one offer and broadcasts DHCP Request message
- The selected server allocates IP address for lease time T
  - Sends DHCP ACK message with T, and two time thresholds
    - T1 (= 0.5T) and T2 (= 0.875T)
  - At T1, host attempts to renew lease by sending DHCP Request message to the original server
  - If no reply by T2, host broadcasts DHCP Request to any server
  - If no reply by T, host must relinquish the IP address and begin the DHCP process from scratch
