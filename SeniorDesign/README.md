# Senior Design: Secure Wireless Aircraft Data Load

Welcome to the Senior Design repository! This capstone project (sdmay26-36) addresses the challenge of securely loading software onto aircraft via wireless channels, balancing cybersecurity requirements with aviation certification constraints.

---

## 🚀 Project Overview

* **Objective**: Create a simplified mockup of an aircraft dataload system with added wireless support, focusing on cybersecurity, network design, and compliance with aviation standards.  
* **Team**: Multi-disciplinary engineering team working across two semesters (2025–2026).  
* **Sponsor Context**: Addresses real-world challenges in aviation software deployment — strict airline procedures, certification requirements, and infrastructure compatibility.

---

## 🔑 Key Contributions

1. **EAP-TLS Mutual Authentication**  
   Implemented EAP-TLS-based authentication using a RADIUS server to secure the wireless dataload channel between ground systems and aircraft.

2. **PKI & Certificate Management**  
   Designed and deployed a Public Key Infrastructure for certificate issuance, validation, and revocation across the dataload system.

3. **Threat Modelling**  
   Conducted threat modelling sessions to identify attack surfaces in the wireless channel and developed mitigations aligned with aviation security standards.

4. **DO-178C Compliance**  
   Ensured system design aligned with DO-178C and related aviation certification frameworks, balancing security with airworthiness constraints.

---

## 🛠 Architecture & Tools

* **Authentication**: EAP-TLS over RADIUS with X.509 certificate-based mutual authentication.  
* **PKI**: Certificate authority setup, certificate signing requests, and revocation list management.  
* **Wireless**: Secure wireless channel design addressing intermittent connectivity and interference.  
* **Standards**: DO-178C (Software Considerations in Airborne Systems), ARINC 615A.  
* **Documentation**: Design document, weekly progress reports, and final presentation.

---

## 🔍 Deliverables

- **Design Document**: Comprehensive system architecture and security analysis.  
- **RADIUS Server Setup**: Configuration guide and deployment scripts for the authentication server.  
- **Final Presentation**: End-of-project presentation summarising design decisions, implementation, and results.  
- **Weekly Reports**: Progress documentation tracking milestones across both semesters.

---

## 🔗 Explore the Work

* **RADIUS setup guide**: `/SeniorDesign/RADIUS Server Setup/`  
* **Design document**: `/SeniorDesign/sdmay26-36 - Design Document.docx.pdf`  
* **Final presentation**: `/SeniorDesign/SeniorDesignFinalPresentation.pdf`  
* **Project webpage**: [sdmay26-36.sd.ece.iastate.edu](https://sdmay26-36.sd.ece.iastate.edu)

---
