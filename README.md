# 🎤 InterviewAI - AI Interview Practice Platform

An AI-powered mock interview platform that helps students and job seekers practice HR, Behavioral, and Technical interviews with personalized AI feedback.

![Tech Stack](https://img.shields.io/badge/React-TypeScript-blue)
![AI](https://img.shields.io/badge/Powered%20by-Google%20Gemini-orange)
![Auth](https://img.shields.io/badge/Auth-Firebase-yellow)

## ✨ Features

- **3 Interview Modules**: HR, Behavioral (STAR method), Technical
- **AI Question Generation**: Dynamic questions via Google Gemini, tailored to your resume and target role
- **Multi-Input Recording**: Text typing + voice dictation (Web Speech API)
- **5-Axis AI Feedback**: Relevance, Structure, Clarity, Depth, Confidence — each scored 1-10
- **Follow-Up Questions**: AI-generated probes for realistic interview depth
- **Progress Dashboard**: Score trends, module performance charts, session history
- **Resume Personalization**: Paste resume + job description for tailored questions
- **Dark Theme**: Premium glassmorphism UI with animations

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + Custom CSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Auth & DB | Firebase (Auth + Firestore) |
| AI Engine | Google Gemini API |
| Backend | Node.js + Express + TypeScript |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project created ([console.firebase.google.com](https://console.firebase.google.com))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com/app/apikey))

### 1. Clone & Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Authentication** (Email/Password + Google)
3. Enable **Cloud Firestore** (Start in test mode)
4. Go to **Project Settings** → **General** → Add a Web App → Copy config
5. Go to **Project Settings** → **Service Accounts** → Generate private key (download JSON)

### 3. Set Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000:web:000
```

**Backend** (`backend/.env`):
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### 4. Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## 📂 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── Navbar.tsx
│   │   ├── config/         # Firebase client config
│   │   │   └── firebase.ts
│   │   ├── contexts/       # React Context providers
│   │   │   └── AuthContext.tsx
│   │   ├── pages/          # Route pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── InterviewPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services/       # API communication
│   │   │   └── api.ts
│   │   ├── App.tsx         # Root with routing
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Design system + Tailwind
│   └── .env
│
├── backend/
│   ├── src/
│   │   ├── config/         # Firebase Admin setup
│   │   │   └── firebase.ts
│   │   ├── middleware/      # Auth verification
│   │   │   └── auth.ts
│   │   ├── routes/         # API endpoints
│   │   │   └── interview.ts
│   │   ├── services/       # AI/business logic
│   │   │   └── gemini.ts
│   │   └── index.ts        # Express server
│   ├── .env
│   └── firebase-service-account.json  (you add this)
│
└── README.md
```

## 🎯 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/questions` | No | Generate interview questions |
| POST | `/api/feedback` | No | Analyze answer and get feedback |
| POST | `/api/follow-up` | No | Generate follow-up questions |
| POST | `/api/sessions` | Yes | Save interview session |
| GET | `/api/sessions` | Yes | Get user's sessions |
| POST | `/api/profile` | Yes | Save user profile |
| GET | `/api/profile` | Yes | Get user profile |
| GET | `/api/health` | No | Health check |

## 🏆 Built for GIET Gangapatana Hackathon

**Team**: GIET Gangapatana
**Impact**: Empowering students with AI-powered interview preparation, accessible 24/7.

---

Made with ❤️ using React, Firebase, and Google Gemini AI
