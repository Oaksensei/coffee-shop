# Coffee Shop Management System (Backend + Frontend)

A full-stack Coffee Shop management system with:
- **Backend API** (Node.js)
- **Frontend** (React)

Live demo (frontend): coffee-shop-one-bice.vercel.app

> Note: This repository contains 2 main folders:
> - `backend/`
> - `coffee-shop-react/`

---

## Prerequisites
- Node.js 18+ (recommended)
- npm (or yarn/pnpm)
- A database instance (depends on backend config)

---

## Project Structure
coffee-shop/
├── backend/ # Backend API (Node.js)
└── coffee-shop-react/ # Frontend (React)


---
```bash
// 1) Backend Setup (Node.js)

// Install dependencies
cd backend
npm install

// Configure environment variables
Create a .env file inside backend/.

// Run backend
npm start

// 2) Frontend Setup (React)

// Install dependencies
cd ../coffee-shop-react
npm install

// Configure environment variables (frontend)
Create a .env file inside coffee-shop-react/ (if the project uses it).

// Run frontend
npm start

// Running the Full System (Local)
//Open 2 terminals:

// Terminal 1 (Backend)
cd backend
npm run dev

// Terminal 2 (Frontend)
cd coffee-shop-react
npm start

