# StockFlow Pro

StockFlow Pro is a modern, high-performance, and secure stock trading platform prototype. It features a beautiful, dynamic frontend dashboard, real-time stock price tracking via WebSockets, limit/stop-loss/GTT order matching mechanisms, and a mock payment gateway top-up system.

## Repository Architecture

This repository is structured as a multi-tier workspace:
- **`frontend/`**: The public-facing landing and product information portal, built with React and custom modern styling systems.
- **`dashboard/`**: The secure trading console workspace for authenticated users, supporting charts, watchlists, portfolio analytics, and wallet controls.
- **`backend/`**: A Node.js/Express server providing REST APIs, WebSocket feeds, matching engines, jobs, and database interactions.

---

## Technical Stack

### Backend
- **Core Engine**: Node.js & Express
- **Database**: MongoDB (via Mongoose ODM) & Redis for price caching
- **Real-time Feeds**: WebSockets (`ws`)
- **Authentication**: JWT-based cookie authorization, Google OAuth integration, secure 2FA/OTP signup validation
- **Integrations**: Razorpay payment APIs (with simulated demo gateways) and Yahoo Finance price polling engines

### Frontends (Dashboard & Landing page)
- **Framework**: React.js
- **Styling**: Vanilla CSS, Tailwind CSS utilities, Material UI components
- **State & Context**: React Context API, custom WebSocket price feed hooks (`usePriceFeed`)
- **Charts**: Chart.js & interactive Candle Charts

---

## Core Security & Reliability Improvements

We have recently completed a major architecture hardening phase targeting critical OWASP safety protocols:
1. **Financial Transaction Security**: Eliminated payment verification bypasses; implemented Timing-Safe Signature comparison using HMAC SHA256 hashes.
2. **Multi-Tenant Scoping**: Isolated database holdings and positions checks using strict indexed compound constraints keyed on `userId`.
3. **Brute Force Defense**: Added cryptographically secure OTP generation (`crypto.randomInt`), login/signup rate-limit controls, and limited OTP verification attempts.
4. **Session Protection**: Forced server-side `httpOnly: true` cookies on JWT payloads, blocking Cross-Site Scripting (XSS) vectors.
5. **Observability**: Added clean, structured log generation with timestamp references, and migrated Redis caching logic from blocking `KEYS *` loops to non-blocking `SCAN` cursors.

---

## Setup and Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or Local MongoDB instance
- Redis Server (local or hosted cache instance)

### 1. Backend Setup
Navigate to the backend directory and configure the environment variables:
```bash
cd backend
npm install
cp .env.example .env
```
Fill in the `.env` values (MongoDB URL, Redis connection strings, Razorpay API credentials, JWT Client IDs, and Gmail credentials for OTP delivery).

To start the backend in development:
```bash
npm start
```

### 2. Frontend & Dashboard Setup
Install dependencies and run the React apps locally:
```bash
# In the frontend directory
cd ../frontend
npm install
npm start

# In the dashboard directory
cd ../dashboard
npm install
npm start
```

By default:
- Landing Page: `http://localhost:3005`
- Trading Dashboard: `http://localhost:3001`
- Backend API Host: `http://localhost:3002`

---

## License

This project is proprietary and confidential. All rights reserved.
