# Data Link Layer

---

## 1. Medium Sharing Techniques

All techniques for sharing a shared medium fall into two broad categories:

**Static Channelization** — the medium is partitioned into fixed, dedicated channels assigned to different users. Used in satellite and cellular communication.

**Dynamic Medium Access Control (MAC)** — channels are allocated on demand. Two sub-approaches:

- **Scheduling** — coordinated access using a protocol (e.g., Token Ring)
- **Random Access** — loose coordination; send, wait, and retry if needed (e.g., ALOHA, CSMA, CSMA/CD)

---

## 2. Random Access Protocols

### ALOHA
The simplest random access scheme — send whenever you want, retry on collision. Basis for later, more refined protocols.

### CSMA (Carrier Sensing Multiple Access)
A station **senses the channel** before transmitting:
- **If idle** → begin transmission immediately
- **If busy** → either wait or schedule a backoff, depending on the variant:
  - **1-Persistent CSMA**: Keep sensing; transmit as soon as the channel goes idle (aggressive — high collision risk if multiple stations waiting)
  - **Non-Persistent CSMA**: Wait a random backoff time before sensing again (less aggressive — lower utilization but fewer collisions)

### CSMA/CD (CSMA with Collision Detection)
An improvement over basic CSMA — instead of wasting bandwidth transmitting an entire frame involved in a collision, the station **aborts immediately upon detecting a collision**.

**Collision response procedure:**
1. Detect collision during transmission
2. Abort the transmission
3. Send a short **jamming signal** to notify all stations of the collision
4. Apply a **backoff algorithm** to schedule a future re-sensing time

**Key insight:** In standard CSMA, a collision wastes the entire frame transmission time. CSMA/CD reduces this waste significantly by aborting early.

---

## 3. CSMA/CD Reaction Time

A transmitter must keep transmitting for the full **2t_prop** (twice the one-way propagation delay) period to guarantee it can detect a collision involving its own frame.

**Why 2t_prop?** Consider two stations A and B at maximum distance:
- A begins transmitting at `t = 0`
- B begins transmitting at `t = t_prop - δ` (just before A's signal arrives)
- A detects the collision at `t = 2t_prop - δ`

So a station must hold the carrier for the entire 2t_prop window to ensure it sees any collision it may be involved in.

---

## 4. IEEE 802.3 MAC Protocol

### Truncated Binary Exponential Backoff
The IEEE 802.3 standard uses **1-Persistent CSMA/CD** with this collision resolution algorithm:

- After the **n-th consecutive failure**, the station picks a random integer K from `{0, 1, ..., 2^m - 1}` where `m = min(n, 10)`
- The station then waits **K mini-slots** (each mini-slot = 2t_prop) before sensing again
- The range of K grows with each failure, reducing the chance of repeated collisions
- After **16 failed attempts**, the station gives up and reports an error

### Minimum Frame Size
Because a transmitter must hold the carrier for 2t_prop to detect a collision, there is a minimum frame size requirement.

**Example calculation at 10 Mbps:**
- Max distance: 2500 m (five 500 m segments + 4 repeaters)
- Mini-slot time: `2t_prop = 2 × [2500 m / (2 × 10^8 m/s) + 3 µs × 4] = 49 µs`
- Minimum frame size: `49 µs × 10 Mbps = 490 bits`
- IEEE 802.3 standard requires **64 bytes = 512 bits** (rounded up for safety)

**Implication for higher speeds:** As transmission rate increases, for CSMA/CD to work correctly, you must either:
- **Increase the minimum frame size**, or
- **Reduce the maximum distance** between stations

This is why higher-speed Ethernet standards use smaller network diameters.

---

## 5. IEEE 802.3 MAC Frame Structure

```
| Preamble | SD | Dest Addr | Src Addr | Length | Information | Pad | FCS |
|    7     |  1 |     6     |    6     |   2    |   variable  | var |  4  |
                 <-------------- 64 – 1518 bytes -------------->
```

| Field | Size | Purpose |
|-------|------|---------|
| **Preamble** | 7 bytes | Clock synchronization — alternating `10101010` pattern generates a square wave |
| **SD (Start Delimiter)** | 1 byte | Signals frame start; changes last bits to `10101011` so receiver knows data follows |
| **Destination Address** | 6 bytes | 48-bit MAC address of recipient |
| **Source Address** | 6 bytes | 48-bit MAC address of sender |
| **Length** | 2 bytes | Number of bytes in the Information field (max 1500 bytes = `0x05DC`) |
| **Information** | variable | Payload data |
| **Pad** | variable | Zero-padding to ensure minimum frame size of 64 bytes |
| **FCS** | 4 bytes | CRC-32 error check covering addresses, length, information, and pad |

**Notes:**
- Max frame size: **1518 bytes** (excluding preamble and SD)
- The NIC automatically discards frames with incorrect lengths or failed CRC checks

---

## 6. Ethernet Physical Layer Standards

| Standard | Medium | Max Segment Length | Topology |
|----------|--------|--------------------|----------|
| **10Base5** | Thick coaxial cable | 500 m | Bus |
| **10Base2** | Thin coaxial cable | 200 m | Bus |
| **10BaseT** | Twisted pair (Cat3) | 100 m | Star |
| **100BaseT** | CAT5 twisted pair | 100 m | Star |

### Hubs vs. Switches

| Device | Behavior | Collision Domain | Broadcast Domain |
|--------|----------|-----------------|-----------------|
| **Hub** | Broadcasts every packet to all ports | Shared (one collision domain) | Shared |
| **Switch** | Forwards packets only to the correct destination port | Separate per port | Shared |

- Hubs use star topology but behave like a bus — all devices share the same collision domain
- Switches eliminate per-port collision domains, greatly improving efficiency and scalability

---

## 7. Network Interconnection Devices

Devices operate at different layers of the network stack:

| Device | Layer | Function |
|--------|-------|----------|
| **Repeater** | Physical (Layer 1) | Amplifies/regenerates signal to extend distance |
| **Switch / Bridge** | Data Link / MAC (Layer 2) | Forwards frames based on MAC address |
| **Router** | Network (Layer 3) | Routes packets based on IP address |
| **Gateway** | Layer 4+ | Translates between different protocols or network architectures |

---

## 8. Ethernet LAN Evolution

| Year | Milestone |
|------|-----------|
| 1970 | ALOHAnet radio network deployed in Hawaii |
| 1973 | Metcalfe & Boggs invent Ethernet (random access over wired networks) |
| 1985 | IEEE 802.3 standard published — 10 Mbps |
| 1995 | Fast Ethernet — 100 Mbps |
| 1998 | Gigabit Ethernet — 1 Gbps |
| 2002 | 10 Gigabit Ethernet |
| 2007 | 100 Gigabit Ethernet |

Ethernet remains the dominant LAN standard today.