# COMS309: Software Development Practices

Welcome to the COMS309 repository! In this course, we designed and delivered a collaborative, full-stack job-search platform focused on helping students build professional connections within their field. Below is an overview of the project phases, key features, and the technologies we employed.

---

## 🚀 Project Overview

* **Objective:** Create a web application that organizes users into career clusters (e.g., engineering, business) to simplify peer and mentor discovery on campus.
* **Team Structure:** Four-person Agile (Scrum) team, with two-week sprints, daily stand-ups, sprint reviews, and continuous stakeholder (TA) feedback.

---

## 🔑 Key Features

1. **Cluster-Based Discovery**
   Segregates users by major/career cluster, enabling targeted search and recommendations.

2. **RESTful Backend APIs**
   Designed endpoints for user registration, cluster search, job postings, and messaging workflows.

3. **Hugging Face AI Moderation**
   Integrated an NLP model to detect and filter inappropriate language in chat conversations.

4. **Efficient Data Ingestion**
   Automated import of 1,000+ universities and 2,000+ majors from Excel into MySQL on each deployment.

5. **Secure Messaging**
   Implemented one-to-one encrypted chat and real-time group notifications using WebSockets and CI/CD pipelines.

6. **Search & Filter**
   Allows users to search peers by university, major, or cluster, with pagination and performance tuning.

7. **Continuous Integration & Deployment**
   Set up CI/CD workflows for automated testing, linting, and deployment to staging and production.

8. **Recognition** <strong>Won 2nd place</strong> in the course competition for best user-centric design and technical implementation.

---

## 🛠 Architecture & Workflow

* **Backend:** Java Spring Boot, MySQL database, REST controllers, service layer for business logic.
* **Data Pipeline:** Java code to parse Excel sheets and populate normalized tables via JDBC.
* **AI Service:** Deployed Hugging Face transformer model as a microservice for chat content analysis.
* **Messaging:** WebSocket-based real-time chat and notification system with encrypted payloads.
* **DevOps:** GitHub Actions workflows for unit/integration tests, and Docker builds.

---

## 🎥 Demo Video

Watch a walkthrough of the platform in action: [YouTube Demo](https://youtu.be/6HS6Ora1hDE?si=uHet-HNUV5WVmsuj)

---