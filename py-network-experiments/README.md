# Python Networking Toolkit

A suite of custom Python tools demonstrating socket programming, protocol analysis, and network automation. Each project includes a detailed walkthrough page with code explanations.

---

## 🛠 Projects

### 1. TCPChatRoom
Real-time multi-client TCP chat server and client demonstrating concurrent socket handling with `threading`.
- **Server**: Accepts connections, spawns threads per client, broadcasts messages to all peers.
- **Client**: Non-blocking I/O with separate send/receive threads.
- **Files**: `Server.py`, `Client.py`

### 2. ReverseShell
TCP-based reverse shell enabling remote command execution — illustrates raw socket usage, `subprocess` management, and directory navigation.
- **Server**: Listener that dispatches commands and receives output.
- **Client**: Connects back to the server, executes commands locally, returns results.
- **Files**: `server.py`, `client.py`

### 3. SocketProgramming
Foundational examples covering TCP socket creation, DNS resolution, and server connection with robust error handling.
- **Files**: `Sockets.py`

### 4. SQLInjectionScanner
Automated form/URL scanner to detect SQL injection vulnerabilities by parsing web forms with BeautifulSoup, injecting payloads, and analysing HTTP responses for bypass indicators.
- **Files**: `scan.py`

### 5. Client-Server
Basic client-server demonstration — the server listens and sends a greeting, the client connects, receives, and terminates. Illustrates the complete socket lifecycle.
- **Files**: `Server.py`, `Client.py`

---

## 🚀 Technologies

- Python 3
- `socket` module (TCP/UDP)
- `threading` for concurrency
- `subprocess` for shell execution
- `BeautifulSoup` & `requests` for web scraping
- Network security concepts

---

## 🔗 Explore

* **TCPChatRoom**: `/py-network-experiments/TCPChatRoom/`
* **ReverseShell**: `/py-network-experiments/ReverseShell/`
* **SocketProgramming**: `/py-network-experiments/SocketProgramming/`
* **SQLInjectionScanner**: `/py-network-experiments/SQLInjectionScanner/`
* **Client-Server**: `/py-network-experiments/Client-Server/`

---
