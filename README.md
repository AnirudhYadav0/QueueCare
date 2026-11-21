# QueueCare – Smart Clinic Queue & Appointment Management System

QueueCare is a full-stack smart hospital and clinic queue management platform designed to eliminate waiting room congestion, provide real-time token tracking, and streamline doctor-patient workflows.

---

## 🌟 Key Features

### 👤 Patient Portal
- **Fast Registration & Authentication**: Secure JWT-based registration and login with bcrypt password hashing.
- **Smart Appointment Booking**: Department-filtered doctor selection, real-time slot checking (preventing double-bookings), symptoms/reason entry, and immediate booking confirmation.
- **Digital Pass & QR Check-In**: Every booked consultation generates a digital pass featuring a high-resolution QR code and a 4-digit security PIN for contactless kiosk or arrival check-in.
- **Real-Time Live Queue Tracking**: View current serving token, your assigned digital token, number of patients waiting ahead, and dynamically calculated waiting time powered by Socket.IO.
- **Instant Turn Notifications**: In-app toasts, sound alerts, and unread notification badges alert patients the moment the doctor calls their token.
- **Medical Records & Prescriptions**: View complete past visit history, doctor consultation notes, and prescriptions.

### 🩺 Doctor Console
- **Clinical Workstation Dashboard**: Daily overview with KPI stats (appointments today, currently waiting in queue, consultations completed, average visit pace).
- **One-Click Queue Control**: Call Next Patient, Start Consultation, Finish Visit (with diagnosis notes & prescription), or Skip No-Shows with reason tracking.
- **Real-Time Waiting Room Broadcast**: Any doctor queue action triggers instant WebSocket updates across all connected patient screens and waiting room displays.
- **Schedule & Availability Management**: Toggle between *Available* and *On Break / Unavailable*, configure working shift hours, consultation room number, and average consultation minutes.

### 🛡️ Administration Command Center
- **Executive KPI Dashboard**: Total patients, active doctors, appointments today, waiting line size, completed consultations, and cancellations.
- **Interactive Recharts Analytics**:
  - 7-Day consultation volume trend (Area Chart).
  - Appointment outcome breakdown (Donut / Pie Chart).
  - Department volume analysis (Bar Chart).
  - Hourly waiting room arrival curves (Line Chart).
- **Doctor Management (CRUD)**: Register new physicians, assign clinical specialties, set consultation fees, and assign rooms.
- **Patient Directory**: Searchable directory with emergency contacts, blood group, and medical profile info.
- **Department Management (CRUD)**: Create and configure specialties (Cardiology, Pediatrics, Orthopedics, General Medicine) and custom token prefixes (`CARD`, `PEDI`, `ORTH`, `GEN`).
- **Live Multi-Room Queue Monitoring**: Side-by-side surveillance of all doctors consulting today.
- **Clinic Configurations**: Manage operating hours (opening, closing, operating days) and slot duration.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, React Router DOM 7 |
| **Styling & UI** | Tailwind CSS 3, Lucide React icons, Clsx |
| **Charts** | Recharts |
| **QR Code Engine** | `qrcode` (backend data URLs), `qrcode.react` (client-side passes) |
| **Notifications** | React Hot Toast, In-App Notification Center |
| **Real-Time Sync** | Socket.IO & Socket.IO Client |
| **Backend** | Node.js, Express.js |
| **Database & ODM** | MongoDB Atlas / Mongoose (with automated local in-memory fallback for zero-friction setup) |
| **Authentication** | JSON Web Tokens (JWT) & BcryptJS |
| **API Client** | Axios (with bearer token request interceptors & automatic 401 handling) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x, v20.x, or v23.x recommended)
- **npm** (v9+ or v10+)
- **MongoDB** (Local MongoDB daemon, MongoDB Atlas URI, or the built-in in-memory fallback)

### 2. Installation

Clone or open the repository folder and install dependencies:

```bash
# Install root, backend server, and frontend client dependencies
npm run install:all
```

Or install individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Configuration

#### Backend (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/queuecare
JWT_SECRET=queuecare_super_secret_jwt_key_2026_dev_prod
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Note: If `MONGODB_URI` points to a host without a running MongoDB daemon, QueueCare automatically spins up an in-memory MongoDB instance for local testing without crashing!)*

#### Frontend (`client/.env` - optional):
```env
VITE_API_URL=/api
```

### 4. Seed Database (Sample Accounts & Live Queues)

QueueCare automatically seeds initial data if the database is empty upon starting, or you can run the seed script directly:

```bash
npm run seed
```

This generates:
- **1 Clinic Profile**: QueueCare Medical & Specialty Center
- **4 Clinical Departments**: Cardiology (`CARD`), Pediatrics (`PEDI`), Orthopedics (`ORTH`), General Medicine (`GEN`)
- **4 Attending Physicians** with active room allocations
- **5 Registered Patients** with appointments and live tokens
- **Today's Active Queue**: Pre-populated with tokens `CARD-01` (completed), `CARD-02` (in consultation), `CARD-03` (waiting), and `CARD-04` (waiting) for immediate queue testing!

---

## 🔑 Demo Credentials (1-Click Login Available)

On the **Sign In** page (`/login`), click any of the 1-click demo buttons:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | System Administrator | `admin@queuecare.com` | `admin123` |
| **Doctor** | Dr. Sarah Jenkins (Cardiology, Room 101) | `doctor.sarah@queuecare.com` | `doctor123` |
| **Doctor** | Dr. Marcus Chen (Pediatrics, Room 204) | `doctor.marcus@queuecare.com` | `doctor123` |
| **Patient** | John Doe (Token `CARD-03` in live queue) | `patient.john@queuecare.com` | `patient123` |
| **Patient** | Emily Davis | `emily.davis@example.com` | `patient123` |

---

## 🏃 Running the Application

### Development Mode (Concurrent)

Start backend server and frontend client concurrently:

```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Client (Port 5173)
npm run dev:client
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Testing the Live Real-Time Queue Flow

To witness the real-time queue synchronization:

1. **Open Window 1 (Patient)**:
   - Log in as **John Doe** (`patient.john@queuecare.com` / `patient123`).
   - Navigate to **Live Queue Tracking** (`/patient/queue`).
   - Notice: Your Token is **CARD-03**, Current Serving is **CARD-02**, Patients Ahead: **1**, Estimated Wait: **15 mins**.

2. **Open Window 2 (Doctor)** (in an incognito window or second browser):
   - Log in as **Dr. Sarah Jenkins** (`doctor.sarah@queuecare.com` / `doctor123`).
   - Navigate to **Doctor Dashboard** or **Today's Live Queue** (`/doctor/queue`).
   - Click **Finish Visit** on token `CARD-02` and type clinical notes.
   - Click **Call Next Patient**.

3. **Observe Window 1 (Patient)**:
   - Instantly (zero page refresh), an audio chime and full-screen alert triggers: **"Token CARD-03: You Are Being Called! Please proceed to Room 101."**
   - Patients Ahead automatically drops to **0**.

---

## 🚢 Deployment Guide

### Deploying Backend to Render / Railway / Fly.io

1. Create a **Web Service** pointing to the repository.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default for Render)
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A strong random 64-char key>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### Deploying Frontend to Vercel

1. Import repository on **Vercel**.
2. Root Directory: `client`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com/api`

---

## 📄 License

MIT License. Built for modern clinics and hospitals seeking frictionless patient care.
