# CodeCollab – Real-Time Collaborative Coding Platform

A real-time collaborative coding platform that lets multiple 
developers write and edit code together live, with JWT-secured 
workspaces, WebSocket sync, and a full CI/CD deployment pipeline.

🔴 **[Live Demo](https://sidharthnair-dev.netlify.app/)**

---

## ✨ Features

- Real-time multi-user code editing under 100ms latency
- JWT-based authentication & workspace-level access control
- Multi-tenant PostgreSQL schema with strict data isolation
- Monaco Editor integration for a VS Code-like experience
- GitHub Actions CI/CD pipeline deployed to AWS EC2
- Dockerized backend with secrets & CORS management

---

## 🛠 Tech Stack

**Backend:** Java, Spring Boot, Spring Security, JWT, 
WebSockets (STOMP)  
**Frontend:** React, Monaco Editor  
**Database:** PostgreSQL (Neon)  
**DevOps:** Docker, GitHub Actions, AWS EC2, Netlify, Render  

---

## 🏗 Architecture

- React + Monaco Editor for the coding interface
- Spring Boot REST APIs for auth, workspaces, file operations
- JWT authentication with Spring Security
- PostgreSQL for users, workspaces, and file metadata
- WebSockets (STOMP) for real-time multi-user editing
- Docker + GitHub Actions CI/CD → AWS EC2

---

## 🚀 Deployment

Backend containerized with Docker and deployed via GitHub 
Actions CI/CD pipeline to AWS EC2.

**Deployment stack:**
- Docker
- GitHub Actions
- AWS EC2
- Netlify (frontend)
- Neon PostgreSQL

---

## 📸 Screenshots

![Login Screen](assets/Capture.png)

---

## ⚙️ Local Setup

### Prerequisites
- Java 17+
- Node.js
- Docker
- PostgreSQL

### Run locally
```bash
# Clone the repo
git clone https://github.com/sidharthnair7/code-collab-platform

# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install && npm run dev
```

---

## 🗺 Roadmap

- Presence indicators for active collaborators
- Collaborative cursor awareness
- Secure WebSocket auth flow refinement

---

## 📬 Contact

- LinkedIn: [sidharthnair7](https://www.linkedin.com/in/sidharthnair7/)
- Email: realsid6@gmail.com
