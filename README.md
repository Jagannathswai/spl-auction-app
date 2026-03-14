# 🏏 IPL AUCTION PLATFORM — Full Stack Clone

A fully functional **Mock IPL Auction System** built with React, Node.js, MongoDB & Socket.io.

---

## ✨ Features

### Core Auction Features
- 🏟️ **Multi-Room Auction Support** — Create multiple isolated auction rooms with unique codes
- ⚡ **Real-Time Live Bidding** — Socket.io powered instant bid updates
- ⏱️ **Live Countdown Timer** — Auto-resets on each new bid
- 🏏 **Player Management** — Full CRUD with photo upload
- 🏆 **Team Management** — Custom colors, logo upload, purse tracking
- 📋 **Auction Log** — Complete history of all bids and sold/unsold outcomes

### Additional Features
- 📸 **Player & Team Photo Upload** — Upload images with preview
- 📊 **Analytics Dashboard** — Bar, Pie & Doughnut charts using Chart.js
- 📤 **Export to Excel** — Players list, team summary, and auction log
- 📧 **Email Notifications** — Nodemailer (Gmail SMTP)
- 📱 **WhatsApp Notifications** — Twilio integration
- 💬 **Live In-Room Chat** — Real-time chat for all participants
- 🌙 **Dark Mode UI** — IPL-themed dark interface
- 🔐 **JWT Auth** — Secure login for Admin and Team Owners
- 👥 **Role-Based Access** — Admin (full control) + Team Owner (bidding only)

---

## 🗂️ Project Structure

```
ipl-auction/
├── backend/
│   ├── models/          # Mongoose schemas (User, Player, Team, Room)
│   ├── routes/          # Express API routes
│   ├── sockets/         # Socket.io event handlers
│   ├── middleware/       # JWT auth middleware
│   ├── utils/           # Email/WhatsApp notifications
│   ├── uploads/         # Player & team photos
│   └── server.js        # Main entry point
└── frontend/
    └── src/
        ├── pages/       # Login, Dashboard, Players, Teams, Rooms, AuctionRoom, Analytics
        ├── components/  # Layout, Sidebar
        └── store/       # Zustand global state
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure env
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, email credentials

# Start server
npm run dev
# Server runs on http://localhost:5000
```

### 2. Create Admin User

After backend starts, run:
```bash
curl -X POST http://localhost:5000/api/auth/admin/seed
```
This creates:  
**Email:** `admin@ipla.com`  
**Password:** `admin123`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start React app
npm start
# App runs on http://localhost:3000
```

---

## 📱 How to Use

### Admin Flow:
1. Login as Admin
2. **Players** → Add players with photos, stats, base price, grade
3. **Teams** → Create teams with colors, logo, purse budget
4. **Teams** → Assign team owner (a registered user with role `team_owner`)
5. **Rooms** → Create an Auction Room (configure timer, bid increment)
6. **Rooms** → Add players and teams to the room
7. **Auction Room** → Start auction for any available player
8. Watch bids come in live, click **SOLD** or **UNSOLD**
9. **Analytics** → View charts and export to Excel

### Team Owner Flow:
1. Register/Login with role `team_owner`
2. Admin assigns you to a team
3. Go to Auction Room
4. Place bids using the +5L, +10L, +20L, +50L, +100L buttons
5. Chat with other participants

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/players` | List players |
| POST | `/api/players` | Add player (admin) |
| GET | `/api/teams` | List teams |
| POST | `/api/teams` | Create team (admin) |
| GET | `/api/rooms` | List rooms |
| POST | `/api/rooms` | Create room (admin) |
| PUT | `/api/auction/:roomId/start/:playerId` | Start auction |
| PUT | `/api/auction/:roomId/bid` | Place bid |
| PUT | `/api/auction/:roomId/sold` | Mark sold |
| PUT | `/api/auction/:roomId/unsold` | Mark unsold |
| GET | `/api/export/auction/:roomId/excel` | Download Excel |

---

## 🔧 Configuration (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ipl-auction
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# WhatsApp via Twilio (optional)
TWILIO_SID=your_sid
TWILIO_AUTH=your_auth
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Zustand, Chart.js |
| Styling | Custom CSS (IPL dark theme), Google Fonts |
| Real-time | Socket.io |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| File Upload | express-fileupload |
| Email | Nodemailer |
| WhatsApp | Twilio |
| Export | SheetJS (xlsx) |

---

## 📦 Deployment

### Backend (Railway/Render/VPS):
```bash
# Set environment variables on your hosting platform
# PORT, MONGO_URI, JWT_SECRET, etc.
npm start
```

### Frontend (Vercel/Netlify):
```bash
# Set REACT_APP_API_URL to your deployed backend URL
npm run build
# Deploy the build/ folder
```

---

## 🆕 Additional Features vs Original SPECAUC

| Feature | Original | This Clone |
|---------|----------|-----------|
| Player Photos | ❌ | ✅ Upload & display |
| Multi-Room Support | ❌ | ✅ Multiple isolated rooms |
| Analytics Dashboard | ❌ | ✅ Charts & insights |
| Export to Excel | ❌ | ✅ Full auction report |
| Email Notifications | ❌ | ✅ Nodemailer |
| WhatsApp Notifications | ❌ | ✅ Twilio |
| Live Chat | ❌ | ✅ Room-based chat |
| Dark Mode | Partial | ✅ Full IPL theme |
| Bid History | Limited | ✅ Full per-player history |
| Team Role Tracking | ❌ | ✅ BAT/BWL/AR/WK stats |

---

Made with ❤️ by your developer
