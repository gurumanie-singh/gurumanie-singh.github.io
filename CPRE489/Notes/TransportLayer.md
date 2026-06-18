# CPR E 4890 — Topic 6: Transmission Control Protocol (TCP)
> Complete study notes compiled from all lecture slides.

---

## TCP Segment Header

```
 0       4       8               16                              31
 ├───────────────────────────────┼───────────────────────────────┤
 │          Source Port          │        Destination Port       │
 ├───────────────────────────────────────────────────────────────┤
 │                       Sequence Number                         │  ← byte index: position of 1st byte
 ├───────────────────────────────────────────────────────────────┤
 │                    Acknowledgment Number                      │  ← cumulative ACK
 ├───────┬───────┬───────────────────────────────────────────────┤
 │  Data │ Resv. │   Control Bits    │          Window           │
 │Offset │       │URG ACK PSH RST SYN FIN                        │
 ├───────────────────────────────┬───────────────────────────────┤
 │           Checksum            │        Urgent Pointer         │
 ├───────────────────────────────────────────────────────────────┤
 │  Option-Kind #1 │ Option-Len #1  │       Option-Data #1       │
 ├──────────────────────────────  ···  ──────────────────────────┤
 │  Option-Kind #N │ Option-Len #N  │  Option-Data #N  │ Padding │
 ├───────────────────────────────────────────────────────────────┤
 │                            Data                               │
 └───────────────────────────────────────────────────────────────┘
```

### Control Bits (bit positions 0–5 within the field):
| Bit | Name | Abbrev | Use |
|---|---|---|---|
| 0 | Urgent Bit | URG | Urgent pointer is valid |
| 1 | Acknowledgment Bit | ACK | Acknowledgment number is valid |
| 2 | Push Bit | PSH | Push data to application immediately |
| 3 | Reset Bit | RST | Reset the connection |
| 4 | Synchronize Bit | SYN | Synchronize sequence numbers (connection setup) |
| 5 | Finish Bit | FIN | Sender has finished sending (connection teardown) |

---

## 1. TCP ACK

### Acknowledgment Number
- The ACK number = **index of the next byte** the receiver expects to receive
- It is **NOT** the index of the next datagram/segment — it is a **byte index**
- Why? TCP segments may have **variable lengths**, and retransmitted segments may include more data than the original

### TCP ACK is Cumulative
- A single ACK acknowledges all bytes **up to** the ACK number
- TCP uses a **special version of Selective Repeat (SR) ARQ** — no NAKs, only ACKs

### Cumulative ACK Example
```
Sender transmits 3 segments:
  Seg 1: bytes 0–999
  Seg 2: bytes 1000–1999
  Seg 3: bytes 2000–2999

Receiver sends:
  ACK(1000)  ← received seg 1, expecting byte 1000
  [seg 2 lost]
  ACK(1000)  ← duplicate ACK (dup ACK) — still waiting for byte 1000
```

### Duplicate ACK (Dup ACK) as Implicit NAK
- TCP has **no NAK** — it relies on **duplicate ACKs**
- The **3rd duplicate ACK** (4th ACK with the same sequence number) = implicit NAK
- Triggers **Fast Retransmit** without waiting for RTO

---

## 2. Establishing a TCP Connection (Three-Way Handshake)

TCP uses a **three-way handshake** to establish a connection.

**ISN** = Initial Sequence Number (a byte index, chosen by each side independently)

```
       Client (Site 1)                           Server (Site 2)
────────────────────────                      ──────────────────────
Send SYN, seq=x (ISN)  ──────────────────►
                                              Receive SYN segment
                                              Enter SYN Queue (TCB)
                        ◄──────────────────  Send SYN seq=y, ACK x+1 (ISN)
Receive SYN + ACK
Send ACK y+1           ──────────────────►
                                              Receive ACK segment
                                              Connection established
```

- Each **control packet (SYN, FIN) consumes 1 sequence number**
- **TCB** = Transmission Control Block (server allocates memory for connection state)

### SYN Queue and SYN Flood Attack
- When server receives SYN, it puts connection state into a **SYN Queue** (half-open connection)
- **SYN Flood Attack** = Denial-of-Service (DoS) attack: attacker sends massive SYN requests → fills SYN queue → server runs out of memory → legitimate connections blocked
- **Defense:** SYN Cookies

### SYN Cookies Defense
Server generates ISN `y` as a 32-bit value encoding:
```
y = [5-bit t][3-bit m][24-bit s]
  where:
    t = time mod 32
    m = 8 possible options for MSS (Maximum Segment Size)
    s = hash(server IP, server port #, client IP, client port #, t)
```
- Server does **NOT** allocate memory until client sends ACK(y+1)
- Upon receiving ACK(y+1), server:
  1. Checks `t` against current time to see if the request has **expired**
  2. **Recomputes `s`** to verify this is a valid cookie
  3. **Decodes `m`** to figure out the MSS option

---

## 3. Terminating a TCP Connection (Modified Three-Way Handshake)

TCP uses a **modified three-way handshake** to terminate a connection. Connection teardown is **half-duplex** — each side terminates independently.

```
       Site 1 (initiator)                        Site 2
────────────────────────                      ──────────────────────
(application closes connection)
Send FIN seq=x         ──────────────────►
                                              Receive FIN segment
                                              Send ACK x+1
                                              (inform application)
                        ◄──────────────────  [data from site 2 to site 1 may still flow]
Receive ACK                                  (application closes connection)
                        ◄──────────────────  Send FIN seq=y, ACK x+1 (FIN+ACK combined)
Receive FIN + ACK
Send ACK y+1           ──────────────────►
                                              Receive ACK segment
                                              Connection fully closed
```

- After sending FIN, a site can still **receive data** from the other direction (half-close)
- The initiating side sends the last ACK and then waits (TIME_WAIT state) before fully closing

---

## 4. TCP Flow Control

**Purpose:** Prevent the sender from **overwhelming the receiver's buffer** with too much data.

### Mechanism
- **Receiver** advertises its **available buffer space** via the **`rwnd` (receiver window)** field in the TCP header — this is the "Window" field
- **Sender** ensures the amount of **outstanding (unacknowledged) data** never exceeds `rwnd`:

```
swnd ≤ rwnd
```
where `swnd` = sender window = amount of outstanding unACKed data

---

## 5. TCP Error Control

- TCP Error Control = **Special version of Selective Repeat (SR) ARQ**
- **ACKs only** (no NAKs)
- Retransmit upon:
  1. **RTO** (Retransmission Timeout)
  2. Reception of the **4th ACK with the same sequence number** (= 3rd duplicate ACK = implicit NAK)
     - Called **Fast Retransmit**

---

## 6. TCP Retransmission Timeout (RTO)

- Every time TCP sends a segment, it starts a **timer** and waits for an ACK
- If the timer expires → segment assumed lost → **retransmit**

### Why RTO is Tricky
TCP must accommodate:
- Differences in time to reach **various destinations**
- Changes in delay as **traffic load varies**

### Problems with Poorly Selected RTO
| RTO too small | RTO too big |
|---|---|
| Unnecessary retransmissions | Low throughput |

### Basic RTT-Based RTO

TCP adapts RTO to **RTT (Round Trip Time) variations**:

```
RTT_EST = α × RTT_EST + (1−α) × RTT_Sample     ← Exponential Weighted Moving Average
```
- α is typically **0.875** (weights recent history heavily)
- `RTT_Sample` = measured time from sending a segment to receiving its ACK

```
RTO = β × RTT_EST
```
- β is typically **2**

### Sender Algorithm (basic)
```
send a packet → start timer
  ├── timeout (RTO)?
  │       YES → retransmit, reset timer, RTO = 2 × RTO
  │       NO  → ACK arrives
  │               ├── Valid RTT sample? (non-retransmitted packet?)
  │               │     YES → compute new RTT_EST, D_EST, RTO
  │               │     NO  → no action
```

---

## 7. Problem #1 — ACK Ambiguity

### The Problem
When a segment is **retransmitted**, which transmission does an incoming ACK correspond to?
- If associated with **original** → RTT_Sample may be too large (overestimate)
- If associated with **retransmission** → RTT_Sample may be too small (underestimate)
- **Either option may cause inaccurate RTT_EST**

### Solution: Karn's Algorithm
1. **Update RTT_EST only** with valid RTT samples from **non-retransmitted** packets
2. **Ignore RTT samples** from retransmitted packets
3. To prevent insensitivity to growing delay: **increase RTO** upon each retransmission:
   ```
   RTO = γ × RTO     (γ typically = 2)
   ```
4. Keep doubling RTO until a **valid RTT sample** is obtained → then reset RTO using newly updated RTT_EST

---

## 8. Problem #2 — High Variance in RTT

### The Problem
- `RTT_EST = α × RTT_EST + (1−α) × RTT_Sample` gives a good **mean** but doesn't account for **variance**
- RTT distributions often have a **heavy tail** — many packets have RTT much larger than the mean
- Packets with RTT > RTO = β × RTT_EST must be retransmitted → unnecessary retransmissions

### Solution: Jacobson's Algorithm (Modified RTO Computation)
Uses both mean AND variance of RTT:

```
[STEP 1]  D_EST = δ × D_EST + (1−δ) × |RTT_Sample − RTT_EST|
                  ← exponential avg of the deviation (variance estimate)
          δ is typically 0.75

[STEP 2]  RTT_EST = α × RTT_EST + (1−α) × RTT_Sample
          α is typically 0.875

[STEP 3]  RTO = RTT_EST + η × D_EST
          η is typically 4
```

> Note: The original formula `RTO = 2 × RTT_EST` is replaced by `RTO = RTT_EST + 4 × D_EST`

### Computing in Practice
```
D_Sample = |RTT_EST − RTT_Sample|
RTT_EST  = 7/8 × RTT_EST + 1/8 × RTT_Sample
D_EST    = 3/4 × D_EST   + 1/4 × D_Sample
RTO      = RTT_EST + 4 × D_EST
```

---

## 9. TCP Congestion Control

**Purpose:** Prevent the sender from **congesting the network** with too much data.

### Three Steps
1. **Sender probes** the network capacity → dynamically adjusts **congestion window** (`cwnd`)
2. **Detect congestion** (interpret packet loss as congestion signal)
3. **Slow down** transmissions upon detecting congestion

### Combined Window Constraint
```
swnd = min(rwnd, cwnd)
```
- `rwnd` = receiver window (flow control limit)
- `cwnd` = congestion window (congestion control limit)
- `swnd ≤ rwnd` AND `swnd ≤ cwnd`

---

## 10. Probing Network Capacity: Two Phases

### Phase 1 — Slow Start (SS)
- **Initial cwnd = 1 MSS** (Maximum Segment Size = **536 bytes** by default)
- **Each time a non-duplicate ACK is received:**
  ```
  cwnd ← cwnd + 1
  ```
- Result: `cwnd` **doubles each RTT** → exponential growth

**Example:**
```
RTT 0:  swnd=[1]       cwnd=1
RTT 1:  swnd=[2,3]     cwnd=2   (2 ACKs received → cwnd += 2 → 2)
RTT 2:  swnd=[4,5,6,7] cwnd=4   (4 ACKs → cwnd=4)
```

### Phase 2 — Congestion Avoidance (CA)
- Entered when **cwnd ≥ ssthresh** (slow start threshold)
- **Each time a non-duplicate ACK is received:**
  ```
  cwnd ← cwnd + 1/⌊cwnd⌋
  ```
- Result: `cwnd` increases by **1 per RTT** → linear (additive) growth

**Example (ssthresh = 4):**
```
RTT 0:  cwnd=1   (SS)
RTT 1:  cwnd=2   (SS)
RTT 2:  cwnd=4   (SS → switch to CA at ssthresh=4)
RTT 3:  cwnd=4 + 1/4×4 = 5   (CA)
RTT 4:  cwnd=5 + 1/5×5 = 6   (CA)
```

```
cwnd
 ▲                                   ssthresh
 │                           ┌───── /
 │                    ┌─────/
 │             ┌─────/
 │      ┌─────/
 │ ┌───/
 │/
 └──────────────────────────────────────► time
   SS ──► CA (when cwnd ≥ ssthresh)
```

---

## 11. Congestion Detection

TCP **interprets segment loss as a congestion signal**.

Retransmit the lost segment upon:
1. **RTO** (Retransmission Timeout)
2. **Reception of the 4th ACK with the same sequence number** = 3rd duplicate ACK (3rd dup ACK)
   - Called **Fast Retransmit**

---

## 12. Slowing Down: TCP Tahoe

Upon **any** congestion detection (RTO or 3rd dup ACK):
```
new_ssthresh = ⌊cwnd/2⌋
new_cwnd     = 1
Restart from SS/CA with new_ssthresh and new_cwnd
```

**TCP Tahoe Flowchart:**
```
Congestion Detected (RTO or 3rd dup ACK)
        │
        ▼
Retransmit lost packet only (SR ARQ)
        │
        ▼
new_ssthresh = ⌊cwnd/2⌋
new_cwnd = 1
        │
        ▼
Restart SS from cwnd=1, with new ssthresh
```

**Behavior:**
```
cwnd
 ▲  ssthresh          ssthresh (new, lower)
 │      ──────────────┐
 │     /              │ congestion
 │    /               │ detected
 │   /                └──►  1
 │  /                        \──────────────
 │ /                          SS → CA (new ssthresh)
 └──────────────────────────────────────► time
```

---

## 13. Slowing Down: TCP Reno

TCP Reno distinguishes between **two types** of congestion:

### Case 1 — RTO (more severe congestion)
Same as TCP Tahoe:
```
new_ssthresh = ⌊cwnd/2⌋
new_cwnd = 1
Restart from SS with new_ssthresh and new_cwnd
```

### Case 2 — 3rd Dup ACK (3 duplicate ACKs = 4th ACK with same seq#)
Less severe — uses **Fast Recovery**:
```
old_cwnd = cwnd
new_ssthresh = ⌊cwnd/2⌋
new_cwnd = ⌊cwnd/2⌋        ← starts CA at new_ssthresh, not SS at 1!
Record the unACKed packets
Enter Fast Recovery
```

**TCP Reno Flowchart:**
```
Congestion Detected
        │
   ─────┼─────
  RTO   │   3 dup ACKs (implicit NAK)
   │    │         │
   ▼    │         ▼
Retransmit    Retransmit lost packet (SR ARQ)
lost pkt      │
   │          │
   ▼          ▼
new_ssthresh = ⌊cwnd/2⌋
new_cwnd = 1          new_cwnd = ⌊cwnd/2⌋   ← record unACKed pkts
   │                        │
   ▼                        ▼
Restart SS/CA          Resume CA from new_ssthresh
                       (Fast Recovery)
```

### Fast Recovery (in detail)
During Fast Recovery, for each **additional dup ACK** received:
- #outstanding_packets = #unACKed_pkts − total_dup_ACKs
- If #outstanding_packets < new_cwnd:
  ```
  M = new_cwnd − #outstanding_packets
  Send M new packets
  ```
- If #outstanding_packets ≥ new_cwnd: do nothing

**Exit Fast Recovery:** when a **non-duplicate ACK** is received → resume normal CA

---

## 14. TCP Reno — Worked Example

**Setup:**
```
Network: 4 RTTs before congestion, cwnd=6, ssthresh=3 (at start of this window)
At 3 RTT, entering a round where cwnd transitions from SS to CA:
  swnd = [8,9,10,11,12], cwnd=4+1/4=5
  swnd = [13,14,15,16,17,18], cwnd=5+1/5=6
```

**At 5RTT (congestion detected):**
```
1st dup ACK A13  → do nothing; cwnd=6
2nd dup ACK A13  → do nothing; cwnd=6
3rd dup ACK A13  → CONGESTION DETECTED
                   Retransmit #13 (Fast Retransmit)
                   Enter Fast Recovery:
                     new_ssthresh = ⌊6/2⌋ = 3
                     new_cwnd     = 3
                   unACKed pkts: [13, 14, 15, 16, 17, 18] → 6 packets

4th dup ACK A13:
  #OPs = 6 unACKed − 3 total dup ACKs = 3 − but wait:
  #OPs = (# unACKed) − (# dup ACKs)... 
  Actually: #OPs = new_cwnd − #dup_ACKs since last retransmit
  #OPs = 6 − 4 = 2 < new_cwnd (3)
  M = new_cwnd − #OPs = 3 − 2 = 1  →  transmit #19

5th dup ACK A13:
  #OPs = 7 − 5 = 2 < new_cwnd (3)
  M = 3 − 2 = 1  →  transmit #20
```

**At 6RTT (exiting Fast Recovery):**
```
A19 arrives (non-dup ACK):
  Exit Fast Recovery
  Resume CA at new_ssthresh=3
  cwnd = 3 + 1/3 ≈ 3⅓
  Outstanding: [19, 20, 21] → transmit #21

A20 arrives:
  cwnd = 3⅓ + 1/3 = 3⅔
  Outstanding: [20, 21, 22] → transmit #22

A21 arrives:
  cwnd = 3⅔ + 1/3 = 4
  Outstanding: [21, 22, 23, 24] → transmit #23, #24
```

---

## 15. TCP Reno — RTO During Fast Recovery (Edge Case)

When an **RTO fires while already in Fast Recovery**, TCP Reno treats it as a new, more severe congestion event:

**Scenario:** 3rd dup ACK already triggered Fast Recovery (new_ssthresh=3, new_cwnd=3), but then a **timeout (RTO) fires for a packet** before Fast Recovery completes.

```
After RTO fires:
  re-transmit lost packet (e.g., #17)
  new_ssthresh = 1
  new_cwnd     = 1
  Restart from SS with new_ssthresh=1, new_cwnd=1
```

**Example walkthrough (RTO fires at 6RTT for #17):**

| Time | Event | Action |
|---|---|---|
| 5RTT | 3rd dup ACK A13 | Enter FR: new_ss=3, new_cwnd=3; re-xmit #13; #OPs=6−3=3 |
| 5RTT | 4th dup A13 | #OPs=6−4=2 < 3; M=1; xmit #19 |
| 6RTT | A17 arrives (non-dup) | Exit FR; cwnd = 3+1/3; swnd=[17,18,19]; do nothing |
| 6RTT | A17 dup ACK | do nothing |
| 6RTT | RTO fires for #17 | Re-xmit #17; **new_ssthresh=1; new_cwnd=1** |

- Note: When TCP Reno exits Fast Recovery on a **partial ACK** (only some unACKed packets acknowledged), it can expose itself to a second loss and RTO. TCP New Reno addresses this.

---

## 16. TCP New Reno

### Key Problem with TCP Reno
TCP Reno exits Fast Recovery on **any non-duplicate ACK** — even a **partial ACK** (which acknowledges only some of the unACKed packets, not all of them). This can expose a second undetected loss and cause an unnecessary RTO.

**Partial ACK:** An ACK that covers some but not all unACKed packets in flight when Fast Recovery began.

**Complete ACK:** An ACK that covers all unACKed packets — every packet that was unACKed when congestion was first detected.

### TCP New Reno Flowchart

```
Congestion Detected
        │
   ─────┴─────────────────────────
  RTO (timeout)            3 dup ACKs (Fast Retransmit)
   │                              │
   ▼                              ▼
Retransmit lost pkt       Retransmit lost pkt (SR ARQ)
new_ssthresh = ⌊cwnd/2⌋   old_cwnd = cwnd
new_cwnd = 1              new_ssthresh = ⌊cwnd/2⌋
   │                      new_cwnd = ⌊cwnd/2⌋
   ▼                      Record ALL unACKed pkts
Restart SS/CA                     │
                           ┌──────┴───────────┐
                       dup ACK?           not dup ACK?
                           │                   │
                           ▼              ┌────┴────────────┐
                    Stay in FR        Partial ACK?    Complete ACK?
                    (#OPs = unACKed       │                  │
                     − total dup ACKs)   ▼                  ▼
                    If #OPs < new_cwnd: Retransmit     Resume CA with
                      Send M new pkts   lost pkt       new_ssthresh
                    (M = new_cwnd −     Stay in FR     and new_cwnd
                         #OPs)
```

### Difference from TCP Reno

| Situation | TCP Reno | TCP New Reno |
|---|---|---|
| Non-dup ACK in FR (partial) | **Exit FR** → exposed to 2nd loss | **Stay in FR**, retransmit next lost packet |
| Non-dup ACK in FR (complete) | Exit FR → resume CA | **Exit FR** → resume CA |
| Handles multiple losses per window | ❌ Poorly | ✅ Better |

### TCP New Reno Worked Example (same scenario as Reno)

**At 5RTT:**
- 1st dup A13: do nothing
- 2nd dup A13: do nothing
- 3rd dup A13: congestion detected → re-xmit #13, enter FR
  - new_ssthresh = new_cwnd = 3; unACKed = [13,14,15,16,17,18]
  - #OPs = 6 − 3 = 3
- 4th dup A13: #OPs = 6−4 = 2 < 3; M=1; xmit #19

**At 6RTT (A17 arrives — partial ACK in New Reno):**
- A17 is a **partial ACK** (not all of [13…18] covered) → stay in FR, retransmit next lost = #18
- A17 dup ACK: do nothing
- A18 (complete ACK) → Exit FR, resume CA

This avoids the RTO that Reno would suffer.

---

## 17. TCP Congestion Control — Classification

### Two Categories

**1. Packet Loss Based (Reactive)**
- TCP Tahoe, TCP Reno, TCP New Reno, TCP CUBIC
- cwnd increases during SS/CA probing until cwnd exceeds network capacity
- Intermediate routers then **drop packets**
- Sender detects loss → reduce cwnd

**2. Packet Delay Based (Proactive)**
- TCP Vegas
- Based on **RTT measurements** — detects congestion *before* packets are dropped
- cwnd increases or decreases during probing depending on observed RTT

### RTT vs cwnd Relationship (Vegas insight)
```
RTT
 ▲
 │              SampleRTT ....../
 │                           /
 │  minRTT = BaseRTT ────── *──────────────
 │                   ↑
 │            true network capacity
 │
 └────────────────────────────────────────► cwnd
```
```
Throughput = cwnd / RTT
 ▲
 │          PeakTH
 │         /     \
 │        /       \
 │ ActualTH ..      \
 │               ↑
 │      true network capacity
 └────────────────────────────────────────► cwnd
```
- As cwnd grows past true network capacity → SampleRTT rises → ActualTH (= cwnd/RTT) drops

---

## 18. TCP Vegas

### Overview
- **Packet delay based** congestion control — proactive (does not wait for packet loss)
- Adjusts cwnd based on the **difference between actual and expected throughput**

### Key Formulas

```
ActualTH = cwnd / SampleRTT          ← current measured throughput

N = (SampleRTT − BaseRTT) × ActualTH
```
- **N** = estimated number of **backlogged packets at intermediate routers**
- **BaseRTT** = minimum observed RTT (approximates uncongested RTT = minRTT)
- **SampleRTT** = most recently measured RTT

### cwnd Adjustment During Congestion Avoidance

| Condition | Action |
|---|---|
| N < α | cwnd = cwnd + 1 per RTT (network underutilized → speed up) |
| N > β | cwnd = cwnd − 1 per RTT (congestion building → slow down) |
| α ≤ N ≤ β | cwnd unchanged |

- Default: **α = 1 MSS**, **β = 3 MSS**

### TCP Vegas Example

```
BaseRTT   = 100 ms
SampleRTT = 120 ms
cwnd      = 30 MSS  (MSS = 1 kbyte = 1000 bytes → cwnd = 30 kbytes)

ActualTH = 30 kbytes / 120 ms = 250 kbytes/s

N = (120 ms − 100 ms) × 250 kbytes/s
  = 20 ms × 250 kbytes/s
  = 5 kbytes
  = 5 MSS

Since N = 5 MSS > β = 3 MSS:
  → cwnd = 30 − 1 = 29 MSS
```

---

## 19. TCP BBR (Bottleneck Bandwidth and Round-trip propagation time)

*Developed by Google.*

### Goal
Maintain cwnd approximately equal to the **BDP (Bandwidth Delay Product)**:
```
BDP = B_max × RTT_min
```
- B_max = bottleneck link bandwidth
- RTT_min = minimum observed RTT (propagation delay only)

### Key Idea: Periodic Bandwidth Probing
- Set cwnd to the pattern `[1.25, 0.75, 1, 1, 1, 1, 1, 1] × cwnd` over **8 RTTs**:
  - **1.25×cwnd:** Probe for more bandwidth
    - If throughput increases → stay at new higher cwnd
    - Else → drop to 0.75× to drain any queue built during the probe
  - **0.75×cwnd:** Drain queues
  - **1×cwnd:** Steady state (repeat 6 times)

### Version History
| Version | Year |
|---|---|
| BBR v1 | 2016 |
| BBR v2 | 2020 |
| BBR v3 | 2024 |

---

## 20. TCP CUBIC

### Overview
- **Packet loss based** (like Tahoe/Reno) but uses a **cubic function** for cwnd growth
- Uses SR ARQ (retransmit lost packet only)
- Default in Linux since kernel 2.6.19; widely deployed

### cwnd Update After Congestion

```
Upon congestion detection:
  Retransmit lost packet (SR ARQ)
  old_cwnd = cwnd
  cwnd = C × (t − ∛(β × old_cwnd/C))³ + old_cwnd
```
- **t** = elapsed time since the last window reduction (congestion detection event)
- **C = 0.4** (scaling factor, by default)
- **β = 0.2** (multiplicative decrease factor, by default)

**At t = 0 (immediately after congestion):**
```
cwnd = C × (0 − ∛(β × old_cwnd/C))³ + old_cwnd
     = C × (−∛(β × old_cwnd/C))³ + old_cwnd
     = −β × old_cwnd + old_cwnd
     = (1 − β) × old_cwnd
     = (1 − 0.2) × old_cwnd
     = 0.8 × old_cwnd
```
So immediately after congestion: **cwnd drops to 80%** of old_cwnd (less aggressive than Reno's 50%).

### Behavior
- The cubic function starts **slow** (slow probing = CA-like), then accelerates, then slows again near old_cwnd (the previous saturation point), then probes further
- Provides **fairness** across competing flows
- Handles high-bandwidth, long-delay networks better than Reno

### TCP CUBIC Example (from slides)
```
RTT = 500 ms, ssthresh = 4, packet #13 is lost, old_cwnd = 6

At t = 0.5s:
  cwnd = 0.4 × (0.5 − ∛(0.2 × 6/0.4))³ + 6
       = 0.4 × (0.5 − ∛3)³ + 6
       ≈ 5.25

cwnd curve: starts below old_cwnd (0.8×6=4.8), grows as cubic, reaches ~5.25 at t=0.5s
```

---

## 21. TCP Congestion Control Comparison

| Protocol | Type | Congestion Signal | RTO Response | 3 Dup ACK Response | Fast Recovery | Key Insight |
|---|---|---|---|---|---|---|
| **TCP Tahoe** | Loss-based | Packet drop | cwnd=1, SS | cwnd=1, SS | ❌ | Simple, treats all loss equally |
| **TCP Reno** | Loss-based | Packet drop | cwnd=1, SS | cwnd=⌊cwnd/2⌋, FR→CA | ✅ | Distinguishes RTO vs dup ACK |
| **TCP New Reno** | Loss-based | Packet drop | cwnd=1, SS | cwnd=⌊cwnd/2⌋, FR→CA | ✅ (improved) | Handles multiple losses/partial ACKs |
| **TCP CUBIC** | Loss-based | Packet drop | cwnd×(1−β), cubic growth | same | ✅ | Cubic window function; Linux default |
| **TCP Vegas** | Delay-based | RTT increase | — | — | N/A | Proactive; adjusts before loss |
| **TCP BBR** | Model-based | BDP estimate | Periodic probe | Periodic probe | N/A | Targets BDP; Google; bandwidth probing |

---

## 22. Key TCP Parameter Summary

| Parameter | Typical Value | Meaning |
|---|---|---|
| MSS | 536 bytes | Maximum Segment Size (default) |
| ssthresh | varies | Threshold between Slow Start and Congestion Avoidance |
| α (RTT_EST EWMA weight) | 0.875 = 7/8 | Weight on old estimate in EWMA for RTO |
| δ (D_EST weight, Jacobson) | 0.75 = 3/4 | Weight on old deviation estimate |
| β (RTO multiplier, basic) | 2 | RTO = β × RTT_EST |
| η (deviation multiplier, Jacobson) | 4 | RTO = RTT_EST + η × D_EST |
| γ (Karn backoff) | 2 | RTO = γ × RTO on retransmission |
| α (Vegas lower threshold) | 1 MSS | Below this → increase cwnd |
| β (Vegas upper threshold) | 3 MSS | Above this → decrease cwnd |
| C (CUBIC scaling) | 0.4 | CUBIC window growth rate |
| β (CUBIC decrease) | 0.2 | CUBIC multiplicative decrease factor |

---

## 23. Full TCP Feature Overview

| Feature | Mechanism | Key Formula/Note |
|---|---|---|
| Reliable delivery | Cumulative ACK + retransmit | ACK# = next expected byte |
| Byte-stream | Sequence numbers are **byte indices** | Variable-length segments |
| Connection setup | 3-way handshake (SYN, SYN+ACK, ACK) | Each SYN/FIN uses 1 seq# |
| Connection teardown | Modified 3-way (FIN, ACK, FIN+ACK, ACK) | Half-duplex teardown |
| Flow control | Receiver window (rwnd) | swnd ≤ rwnd |
| Error control | SR ARQ variant; RTO + 3rd dup ACK trigger | No NAKs; dup ACK = implicit NAK |
| RTO estimation | EWMA + Jacobson | RTO = RTT_EST + 4×D_EST |
| ACK ambiguity | Karn's Algorithm | Only sample non-retransmitted pkts |
| Congestion probing | Slow Start (exponential) + CA (linear) | swnd = min(rwnd, cwnd) |
| Congestion response (Tahoe) | Always: cwnd=1, restart SS | — |
| Congestion response (Reno) | RTO→SS; 3 dup ACK→Fast Recovery | Partial ACK exits FR (weakness) |
| Congestion response (New Reno) | RTO→SS; 3 dup ACK→FR; partial ACK stays in FR | Fixes Reno's partial ACK problem |
| Congestion response (CUBIC) | Cubic function; (1−β)×cwnd immediately | Default on Linux |
| Congestion response (Vegas) | RTT-based; proactive ±1 per RTT | N = (SampleRTT−BaseRTT)×ActualTH |
| Congestion response (BBR) | BDP targeting; periodic bandwidth probing | BDP = B_max × RTT_min |

---

*End of Transport Layer Notes*
