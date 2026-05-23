# ⚡ IPL Nexus AI Auction

> A full-stack, real-time IPL Mega Auction platform powered by **GROK AI**, **Socket.IO**, **Next.js 14**, **Node.js**, and **MongoDB Atlas**.

---

## 🏆 Features

| Feature | Details |
|---|---|
| ⚡ Real-Time Bidding | Socket.IO, instant sync across all users |
| 🤖 GROK AI Strategist | Player analysis, squad recommendations, live commentary |
| ⏱️ Smart Timer | Auto 10s countdown, resets on every bid |
| 💰 Purse Management | ₹100 Cr per team, auto-deducted on purchase |
| 🏟️ 10 IPL Franchises | All official teams with real data |
| 🔐 JWT Auth | Admin / Team Owner / Viewer roles |
| 📊 Analytics | Recharts-powered live spending dashboards |
| 🔨 SOLD/UNSOLD | Animated banners + confetti on sale |
| 📥 Export Results | CSV export of full auction results |
| 🎬 Admin Control | Full player/team/user management |

---

## 📁 Project Structure

```
ipl-nexus/
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── app.js             # Express app config
│   │   ├── server.js          # HTTP + Socket.IO server
│   │   ├── config/
│   │   │   └── database.js    # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── auctionController.js
│   │   │   ├── bidController.js
│   │   │   └── aiController.js    # GROK AI integration
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT protect/adminOnly
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Team.js
│   │   │   ├── Player.js
│   │   │   ├── Auction.js
│   │   │   └── Bid.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── teamRoutes.js
│   │   │   ├── playerRoutes.js
│   │   │   ├── auctionRoutes.js
│   │   │   ├── bidRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── socket/
│   │   │   └── socketManager.js   # Socket.IO event hub
│   │   └── utils/
│   │       ├── logger.js
│   │       └── seed.js            # DB seed with 30 players
│   └── package.json
│
└── frontend/                  # Next.js 14 app
    ├── src/
    │   ├── pages/
    │   │   ├── index.js           # Landing page
    │   │   ├── login.js           # Auth (login/register)
    │   │   ├── auction.js         # Live auction arena
    │   │   ├── players.js         # Player pool + filters
    │   │   ├── analytics.js       # Recharts dashboards
    │   │   ├── leaderboard.js     # Top sold players
    │   │   ├── profile.js         # User profile
    │   │   ├── admin.js           # Admin dashboard
    │   │   ├── teams/
    │   │   │   ├── index.js       # All teams
    │   │   │   └── [id].js        # Team detail + squad
    │   │   └── auction/results/[id].js
    │   ├── components/
    │   │   ├── arena/             # Auction room components
    │   │   ├── ai/                # AI panel sidebar
    │   │   ├── layout/            # Navbar, Layout
    │   │   └── ui/                # Toast, Confetti
    │   ├── hooks/
    │   │   ├── useSocket.js       # Socket.IO hook
    │   │   ├── useAuth.js         # Auth + route guard
    │   │   └── useAuctionTimer.js
    │   ├── store/                 # Redux Toolkit
    │   │   └── slices/
    │   │       ├── authSlice.js
    │   │       ├── auctionSlice.js
    │   │       ├── teamsSlice.js
    │   │       ├── playersSlice.js
    │   │       ├── aiSlice.js
    │   │       └── uiSlice.js
    │   └── utils/
    │       ├── api.js             # Axios + auth interceptors
    │       └── helpers.js         # Formatters, colors, etc.
    └── package.json
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- GROK API key from [x.ai](https://x.ai)

---

### 1. Clone & Install

```bash
# Backend
cd ipl-nexus/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Backend Environment

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ipl_nexus
JWT_SECRET=your_32_char_secret_key_change_this
JWT_EXPIRES_IN=7d

# GROK AI (from x.ai console)
GROK_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxx
GROK_API_URL=https://api.x.ai/v1/chat/completions
GROK_MODEL=grok-beta

FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@iplnexus.com
ADMIN_PASSWORD=Admin@IPL2025!
```

---

### 3. Frontend Environment

```bash
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 10 IPL teams
- 30 real IPL players with stats
- Admin account: `admin@iplnexus.com / Admin@IPL2025!`
- 5 team owner accounts: `owner.mi@iplnexus.com / Owner@IPL2025!`
  - (mi, csk, rcb, kkr, srh)

---

### 5. Run Both Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:3000**

---

## 🔌 Socket.IO Events

### Server → Client (emitted by backend)

| Event | Payload | Description |
|---|---|---|
| `auction:started` | `{ auction }` | Auction goes live |
| `auction:paused` | `{ auctionId }` | Admin pauses |
| `auction:resumed` | `{ auction }` | Admin resumes |
| `auction:completed` | `{ auctionId }` | All players done |
| `auction:player_up` | `{ player, basePrice }` | New player introduced |
| `auction:new_bid` | `{ bid, currentBid }` | Bid placed |
| `auction:sold` | `{ player, team, amount, teamPurse }` | Player sold |
| `auction:unsold` | `{ playerId }` | Player unsold |

### Client → Server

| Event | Payload |
|---|---|
| `join:auction` | `auctionId` |
| `join:team` | `teamId` |
| `timer:sync` | `{ seconds }` |

---

## 🤖 GROK AI API Routes

| Route | Method | Description |
|---|---|---|
| `/api/ai/chat` | POST | Conversational AI strategist |
| `/api/ai/analyze/:playerId` | GET | Deep player analysis |
| `/api/ai/squad/:teamId` | GET | Squad gap recommendations |
| `/api/ai/commentary` | POST | Live auction commentary |
| `/api/ai/budget/:teamId` | GET | Budget optimization strategy |

---

## 🔐 REST API Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me           [protected]
PUT  /api/auth/profile      [protected]
GET  /api/auth/users        [admin]
```

### Auction
```
GET  /api/auction/active
POST /api/auction                      [admin]
POST /api/auction/:id/start            [admin]
POST /api/auction/:id/pause            [admin]
POST /api/auction/:id/resume           [admin]
POST /api/auction/:id/next-player      [admin]
POST /api/auction/:id/sold             [admin]
POST /api/auction/:id/unsold           [admin]
GET  /api/auction/:id/results
```

### Bids
```
POST /api/bids                         [team_owner]
GET  /api/bids/player/:playerId
GET  /api/bids/team/:teamId
```

### Players
```
GET    /api/players?status=&role=&search=
GET    /api/players/:id
POST   /api/players                    [admin]
PUT    /api/players/:id                [admin]
DELETE /api/players/:id                [admin]
```

---

## ☁️ Deployment

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Connect to [vercel.com](https://vercel.com)
3. Set env vars:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
   ```
4. Deploy

### Backend → Render

1. Push backend folder to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in Render dashboard
6. Enable **Auto-Deploy**

### Database → MongoDB Atlas

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create DB user + whitelist IPs (`0.0.0.0/0` for Render)
3. Get connection string → paste as `MONGODB_URI`
4. Run seed: `npm run seed` (once)

---

## 🎭 User Roles & Permissions

| Action | Viewer | Team Owner | Admin |
|---|---|---|---|
| Watch live auction | ✅ | ✅ | ✅ |
| Place bids | ❌ | ✅ | ❌ |
| Use AI chat | ✅ | ✅ | ✅ |
| Manage players | ❌ | ❌ | ✅ |
| Start/pause auction | ❌ | ❌ | ✅ |
| Mark SOLD/UNSOLD | ❌ | ❌ | ✅ |
| View analytics | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 🎨 Tech Stack Summary

**Frontend:** Next.js 14 · React 18 · Tailwind CSS · Framer Motion · Redux Toolkit · Recharts · Socket.IO Client

**Backend:** Node.js · Express · Socket.IO · JWT · bcrypt · Winston · Morgan

**Database:** MongoDB Atlas · Mongoose ODM

**AI:** GROK API (xAI) — chat completions with full auction context

**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (DB)

---

## 🧪 Demo Login Credentials

```
Admin:      admin@iplnexus.com       / Admin@IPL2025!
MI Owner:   owner.mi@iplnexus.com    / Owner@IPL2025!
CSK Owner:  owner.csk@iplnexus.com   / Owner@IPL2025!
RCB Owner:  owner.rcb@iplnexus.com   / Owner@IPL2025!
KKR Owner:  owner.kkr@iplnexus.com   / Owner@IPL2025!
SRH Owner:  owner.srh@iplnexus.com   / Owner@IPL2025!
```

---

## 📜 License

MIT © IPL Nexus AI Auction 2025
