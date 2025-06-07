# CPRE381: Computer Architecture Coursework

Welcome to the CPRE381 repository! In this course, we explored the fundamentals of computer organization and design by implementing and evaluating processor architectures at both the instruction and pipeline levels. This README walks you through the two major projects completed:

---

## 🛠 Part 1: Single-Cycle Processor

### Overview

* **Objective**: Design and implement a single-cycle CPU in VHDL that executes a simplified instruction set architecture (ISA) in one clock cycle.
* **Key Features**:

  * **Instruction Fetch & Decode**: Built modules to fetch 32-bit instructions from instruction memory and decode opcode, register indices, and immediate fields.
  * **ALU & Control Unit**: Developed an arithmetic logic unit (ALU) supporting add, subtract, AND, OR, and set-less-than operations. Constructed a control unit to generate control signals based on the opcode.
  * **Register File & Data Memory**: Implemented a 32×32 register file with synchronous read/write and a data memory block for load/store operations.
  * **Single-Cycle Timing**: Ensured all datapath operations—from instruction fetch to write-back—complete within one clock period.

### Learning Outcomes

* Mastered VHDL syntax and simulation workflows.
* Understood trade-offs of single-cycle design: simplicity vs. critical path length.
* Gained experience with test benches and waveform analysis in ModelSim.

---

## 🛠 Part 2: Pipelined Processor

In Part 2, we upgraded our single-cycle design to a pipelined architecture to improve clock frequency and throughput. We implemented **two versions**:

### 2.1 Software-Scheduled Pipeline

* **Overview**: Introduced a 5-stage pipeline (Fetch, Decode, Execute, Memory, Write-Back) while handling hazards through compiler-directed NOP insertion.
* **Hazard Management**:

  * **Data Hazards**: Used software scheduling to reorder or insert NOPs into instruction streams, preventing RAW hazards without adding hardware complexity.
  * **Control Hazards**: Employed static branch prediction (always-not-taken) and flushed the pipeline on mispredicts by inserting bubble instructions.

### 2.2 Hardware-Scheduled Pipeline

* **Overview**: Built dynamic hazard detection and forwarding logic directly into the hardware datapath.
* **Hazard Detection Unit**:

  * **Forwarding Paths**: Added muxes and forwarding logic to resolve data hazards in the EX stage without stalling.
  * **Stall Logic**: Detected load-use hazards and inserted pipeline stalls (bubbles) when forwarding alone was insufficient.
  * **Branch Handling**: Implemented branch target buffer (BTB) for quick branch resolution and minimal pipeline flushes.

### Performance Comparison

| Version                                         | CPI   | Clock Period (ns) | Throughput (Instr/s) |
| ----------------------------------------------- | ----- | ----------------- | -------------------- |
| Single-Cycle                                    | 1.0   | 20                | 50 M                 |
| Software-Scheduled                              | 1.2\* | 10                | 83 M                 |
| Hardware-Scheduled                              | 1.1\* | 12                | 91 M                 |
| <sup>\*Adjusted for average stall cycles.</sup> |       |                   |                      |

### Learning Outcomes

* Designed and tested pipeline registers and control signal propagation.
* Implemented hardware forwarding and stall units to handle data/control hazards.
* Analyzed trade-offs between compiler-based vs. hardware-based hazard resolution.
* Measured performance metrics and understood critical path shortening in pipelined designs.

---

## 🔍 Explore the Code

* **Single-Cycle Processor**: `/CPRE381/Part1/proj`
* **Software-Scheduled Pipeline**: `/CPRE381/Part2_sw/proj`
* **Hardware-Scheduled Pipeline**: `/CPRE381/Part2_hw/proj`

Feel free to browse the VHDL source files, test benches, and simulation waveforms to see how each design was constructed and validated.

---