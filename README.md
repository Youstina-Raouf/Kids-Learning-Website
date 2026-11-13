# Play, Learn & Protect - Kids Learning Website

A full-stack learning platform for children aged 3-12. Kids play educational games and quests, create their own stories and code projects, and climb a leaderboard. Parents and educators manage accounts, review content and monitor safety through a built-in monitoring dashboard.

Built with **React (Vite)**, **Node.js / Express** and **MongoDB**.

## Features

### Three user roles
| Role | What they can do |
| --- | --- |
| **Child** | Logs in with a child code and 6-digit PIN, plays games and quests, creates artifacts, earns points, views the leaderboard |
| **Parent** | Registers, adds and manages child profiles, monitors each child's activity and safety alerts |
| **Educator** | Creates new games and monitors children |

### Learning
- Educational games and step-by-step quests in six subjects: math, physics, chemistry, language, coding and general
- Three age bands: 3-5, 6-8 and 9-12, plus easy / medium / hard difficulty
- Points for completed steps, quest progress tracking and a leaderboard (overall and per subject)
- A simple math game for younger children

### Creation Lab
- Children can create stories, code projects and drawings, with video and audio supported by the data model
- Submissions start as pending and can be approved or rejected with feedback through the API by the child's parent or by an educator

### Safety and monitoring
- Content check on messages with an English and Arabic filter for inappropriate language and cyberbullying phrases
- Automatic alerts (cyberbullying, inappropriate content, excessive gaming, time limit, suspicious activity) with severity levels and a resolve flow
- Session tracking for each child and a monitoring dashboard with charts

### Security
- Passwords hashed with bcrypt, JWT authentication and role-based protected routes on both backend and frontend
- Child profiles log in with an auto-generated child code and a 6-digit PIN instead of an email

## Tech Stack

**Frontend:** React 18, React Router, Axios, Recharts, Vite

**Backend:** Node.js, Express, MongoDB with Mongoose, JWT, bcryptjs, express-validator, bad-words, natural

## Project Structure

```
Kids-Learning-Website/
├── Backend/
│   ├── config/        # MongoDB connection
│   ├── middleware/    # JWT auth and role checks
│   ├── models/        # User, Child, Game, Quest, Progress, Session, Alert, Artifact, Badge
│   ├── routes/        # auth, children, games, quests, monitoring, artifacts, leaderboard
│   ├── utils/         # safetyFilter (content moderation)
│   └── server.js
└── Frontend/
    └── src/
        ├── components/  # ProtectedRoute, PasswordInput
        ├── context/     # AuthContext
        ├── pages/       # Login, Register, dashboards, games, quests, leaderboard, monitoring
        └── services/    # Axios API client
```

## API Overview

| Route | Purpose |
| --- | --- |
| `POST /api/auth/register`, `/login`, `/child-login`, `GET /api/auth/me` | Authentication |
| `/api/children` | Create, list, view and update child profiles |
| `/api/games` | Browse and create games |
| `/api/quests` | List quests, start them, complete steps, view progress |
| `/api/monitoring` | Sessions, content check, dashboard data and alerts |
| `/api/artifacts` | Submit and review child creations |
| `/api/leaderboard` | Overall and per-subject rankings |
| `GET /api/health` | Health check |

## Getting Started

### Prerequisites
- Node.js 16 or higher
- MongoDB (local or MongoDB Atlas)

### 1. Backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```
MONGODB_URI=mongodb://localhost:27017/plp
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`. The Vite dev server proxies `/api` requests to the backend on port 5000.

### 3. First use
1. Open the app and register a **parent** or **educator** account.
2. As a parent, add a child profile (name, age and a 6-digit PIN).
3. Log in as the child with the generated child code and the PIN.
4. Educators create the first games from the educator dashboard. The app does not ship with sample content.

## Known Limitations and Roadmap
- No seed script yet, so games and quests must be created through the educator dashboard
- No automated tests yet
- Artifact review is available through the API but has no screen in the frontend yet
- `socket.io` and `react-i18next` are installed for planned real-time features and a full Arabic/English interface, but are not wired in yet
- Set a strong `JWT_SECRET` in `.env` for any real deployment

## License

Created for educational purposes.
