# EventHub - Microservices Project

## 📌 Description

EventHub is a distributed web application for managing events and participants.

The system is based on a microservices architecture:
- Django backend (event management)
- Node.js notification service
- React frontend

All services are containerized using Docker and orchestrated with docker-compose.

---

## 🏗️ Architecture

- Backend (Django) → http://localhost:8000
- Notification Service (Node.js) → http://localhost:5001/notifications
- Frontend (React) → http://localhost:3001

---

## 🚀 Run the project (Docker)

```bash
docker compose up --build
