# Bytez

Bytez is a restaurant recommendation web app for discovering restaurants in San Luis Obispo based on mood, cuisine, occasion, and user preferences.

## Features

- User signup and login
- JWT authentication
- Protected restaurant creation routes
- Restaurant filtering
- Favorites system
- Restaurant mood tracking
- Personal restaurant notes
- MongoDB Atlas database integration

---

## Tech Stack

### Frontend
- React
- Vite
- JavaScript

### Backend
- Node.js
- Express

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- bcrypt
- JSON Web Tokens (JWT)

---

## Running the Project

### Install dependencies

```bash
npm install

---

## Sequence Diagrams
- Signup Flow
  sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
  
    User->>Frontend: Enter username + password
    Frontend->>Backend: POST /users/signup
    Backend->>Backend: Hash password with bcrypt
    Backend->>Database: Save user
    Database-->>Backend: User created
    Backend->>Backend: Generate JWT token
    Backend-->>Frontend: Return token
    Frontend-->>User: Signup successful

- Login Flow
  sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
  
    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /users/login
    Backend->>Database: Find user
    Database-->>Backend: Return user
    Backend->>Backend: bcrypt.compare()
    Backend->>Backend: Generate JWT
    Backend-->>Frontend: Return token
    Frontend-->>User: Login successful

- Mermaid
  sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
  
    User->>Frontend: Add restaurant
    Frontend->>Backend: POST /restaurants + JWT
    Backend->>Backend: Verify JWT
    Backend->>Database: Save restaurant
    Database-->>Backend: Restaurant saved
    Backend-->>Frontend: Success response

