# QueueCare Deployment Guide 🚀

QueueCare is ready for instant deployment. Because QueueCare features **real-time Socket.IO WebSockets**, **JWT authentication**, and a **Vite React single-page frontend**, the application is pre-configured to run either:
1. **Unified Mode (Recommended)**: As a single unified web service hosting both the backend API + WebSockets and serving the built React frontend on one domain (Zero CORS issues, easiest setup).
2. **Decoupled Mode**: Frontend hosted on Vercel/Netlify and Backend + WebSockets hosted on Render/Railway.
3. **Containerized Mode**: Self-hosted via Docker or Docker Compose.

---

## Option 1: 1-Click Deploy on Render (Recommended & Free Tier)

Render natively supports long-lived WebSockets (Socket.IO) and Node.js.

### Step 1: Create a Free MongoDB Database on MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Sandbox** cluster (takes ~1 minute).
3. Under **Database Access**, create a database user (e.g., `queuecare_admin` with a password).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** -> **Drivers** -> Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/queuecare?retryWrites=true&w=majority
   ```

### Step 2: Deploy to Render from GitHub
1. Sign in to [render.com](https://render.com) using your GitHub account.
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository: `AnirudhYadav0/QueueCare`.
4. Configure the service settings:
   - **Name**: `queuecare`
   - **Region**: Choose the closest region (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build --prefix client && npm install --prefix server
     ```
   - **Start Command**:
     ```bash
     node server/server.js
     ```
5. Add **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations and static frontend serving |
   | `PORT` | `10000` | Render default port |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | *(Any random 32+ character string)* | e.g. `qc_super_secret_jwt_key_prod_2026` |
   | `JWT_EXPIRE` | `7d` | Token expiry duration |
6. Click **Deploy Web Service**!
   Render will build the React client, install server packages, seed initial data automatically, and give you a live URL: `https://queuecare.onrender.com`.

---

## Option 2: Deploy on Railway (Ultra-Fast)

Railway allows you to spin up Node.js and MongoDB inside one project with 1 click.

1. Sign in to [railway.app](https://railway.app) with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo** -> select `QueueCare`.
3. In the project canvas, click **New** -> **Database** -> **Add MongoDB**.
4. In your QueueCare service settings:
   - Set Environment Variables:
     - `MONGODB_URI`: `${{Mongo.MONGO_URL}}` *(Railway automatically links it)*
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: `your_random_production_jwt_secret`
     - `JWT_EXPIRE`: `7d`
5. Under **Settings** -> **Networking**, click **Generate Domain**.
6. Railway automatically uses `railway.json` to build and deploy.

---

## Option 3: Deploy with Docker / Docker Compose

If you have a VPS (Ubuntu, Debian, DigitalOcean, AWS EC2, GCP Compute Engine):

### Quick Run with Docker Compose:
```bash
# Clone the repo on your server
git clone https://github.com/AnirudhYadav0/QueueCare.git
cd QueueCare

# Start both MongoDB and QueueCare in production containers
docker compose up -d --build
```
Your application will be live at `http://your-server-ip:5000`!

### Standalone Docker Build:
```bash
docker build -t queuecare:latest .
docker run -d -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="your-mongodb-atlas-uri" \
  -e JWT_SECRET="your_secret" \
  queuecare:latest
```

---

## Option 4: Decoupled Deploy (Vercel Frontend + Render/Railway Backend)

If you prefer hosting the React frontend on Vercel:

1. **Deploy Backend first** (on Render or Railway as detailed above). Note your backend URL: e.g. `https://queuecare-api.onrender.com`.
2. **Deploy Frontend on Vercel**:
   - Import `AnirudhYadav0/QueueCare` on [vercel.com](https://vercel.com).
   - Set **Root Directory** to: `client`
   - Set **Build Command**: `npm run build`
   - Set **Output Directory**: `dist`
   - Add Environment Variables in Vercel project settings:
     - `VITE_API_URL`: `https://queuecare-api.onrender.com/api`
     - `VITE_SOCKET_URL`: `https://queuecare-api.onrender.com`
   - Click **Deploy**.
3. In your backend on Render/Railway, set `CLIENT_URL` to your Vercel URL (e.g. `https://queuecare.vercel.app`).

---

## Initial Demo Accounts (Auto-Seeded)

When QueueCare connects to a fresh MongoDB database for the first time, it automatically creates sample departments, doctors, and user accounts so your live demo is functional immediately:

- **Patient Portal**: `patient.john@queuecare.com` / `patient123`
- **Doctor Workstation**: `doctor.sarah@queuecare.com` / `doctor123`
- **Admin Command Center**: `admin@queuecare.com` / `admin123`
