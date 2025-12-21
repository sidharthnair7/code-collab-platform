# CodeCollab Platform

A collaborative code editing platform built with a Spring Boot backend and a React frontend.  
The application focuses on secure, user-based access and workspace management, with real-time collaboration planned.

----------

## Features

- User authentication and authorization using JWT
- Secure REST APIs built with Spring Boot
- User-based workspaces and file management
- PostgreSQL persistence layer
- Modern frontend built with React (work in progress)
- Scalable backend architecture designed for real-time collaboration

----------

## Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Security
- JWT Authentication
- PostgreSQL
- Maven

### Frontend
- React
- JavaScript
- Vite
- CSS

----------

## Project Status

- **Backend:** Complete  
- **Frontend:** In progress  
- **Real-time collaboration:** Planned (WebSockets + STOMP)

This repository currently focuses on backend architecture, authentication, and data modeling.  
Real-time collaborative editing will be added in a future iteration.

----------

## Running the Project Locally

### Prerequisites
- Java 21+ (tested on Java 25 LTS)
- Maven
- PostgreSQL
- Node.js (for frontend)

### Backend
```bash
mvn spring-boot:run
```
### Frontend
``` bash
cd frontend
npm install
npm run dev
