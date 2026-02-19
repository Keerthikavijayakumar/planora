# Planora - AI Project Architect for CS Students

Planora is a SaaS platform that generates structured, domain-specific software project ideas for Computer Science students using Google Gemini AI. It provides full blueprints, roadmaps, and market potential scores.

## 🚀 Features
- **Domain-Based Generation**: Specific logic for AI, Web, Mobile, etc.
- **Skill-Level Customization**: Freshers get simpler stacks and learning paths.
- **Structured Blueprints**: 11-point JSON structure including differentiation and roadmap.
- **Market Scoring**: AI-driven analysis of demand, difficulty, and resume impact.
- **Freemium Model**: 5 ideas per week limit with usage tracking.
- **Save & Manage**: Save your favorite blueprints.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **AI**: Google Gemini API

## 📦 Prerequisites
- Node.js installed (v16+)
- A Firebase Project
- A Google Cloud Project with Gemini API enabled

## 🔧 Setup Guide

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project "Planora".
3. **Authentication**: Enable "Email/Password" and "Google" providers.
4. **Firestore**: Create a database in "Production mode".
5. **Admin SDK**:
    - Go to Project Settings -> Service Accounts.
    - Click "Generate new private key".
    - Save the JSON file. You will need the `private_key`, `client_email`, and `project_id` from this file.
6. **Client Config**:
    - Project Settings -> General -> Add App (Web).
    - Copy the `firebaseConfig` object values.

### 2. Gemini API Setup
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Get an API Key.

### 3. Environment Variables
Create `.env` files in both folders.

**Backend** (`/server/.env`):
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
# Note: Put the private key in quotes and handle newlines if copying directly, 
# or use the JSON file path if you prefer (code supports env var string)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

**Frontend** (`/client/.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Installation & Running

**Backend**:
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5000
```

**Frontend**:
```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

## 🧪 Testing
1. **Register**: Go to `http://localhost:5173/auth` and create an account.
2. **Dashboard**: You should see 0/5 usage.
3. **Generate**: Click "New Idea", select "Web Development" + "Beginner".
4. **Result**: Verify you get a structured blueprint.
5. **Fresher Mode**: Try "Fresher" level to see the "Learning Path" section.
6. **Save**: Click "Save Blueprint" and check "Saved" page.
