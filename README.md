# Sahayak AI (सहायक AI)
### *The Rural & Small Business Multimodal AI Guardian*

[![Node.js](https://img.shields.io/badge/Node.js-v24.22-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Backend-Express%20v4.21-blue.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/AI%20Model-Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20RLS-336791.svg)](https://www.postgresql.org/)

---

## 1. Overview & Core Mission Directive
**Sahayak AI** is an intelligent agentic platform engineered to protect and empower small farmers, shopkeepers, and ordinary families facing language barriers, digital fraud, scams, misinformation, and complex operational decisions across Bharat and developing regions.

### Key Pillars:
1. **Verify & Shield**: Real-time multimodal analysis of suspicious SMS alerts, fake electricity bill disconnection threats, lottery claims, phishing links, and reverse UPI QR code scams with explicit risk scores (0–100%) and immediate safety actions.
2. **Resolve & Recourse**: Step-by-step grievance wizard drafting official complaint letters formatted for the **National Cyber Crime Reporting Portal (cybercrime.gov.in / 1930)**, **National Consumer Helpline (NCH / 1915)**, and **RBI Banking Ombudsman** citing the *Information Technology Act 2000 (Section 66C, 66D)* and *Consumer Protection Act 2019*.
3. **Advise & Optimize**: Low-cost, high-ROI operational guidance (crop fungal/pest management under ₹300, fertilizer schedules, retail udhaar ledger recovery, stock rotation).
4. **Human-in-the-Loop Approval Gate**: Mandatory confirmation prompt requiring explicit user authorization before submitting official petitions or executing high-stakes automated tasks.
5. **Vernacular Accessibility**: Complete native UI and spoken voice reading (Text-to-Speech) in **7 languages**:
   - English
   - Hindi (हिंदी)
   - Bengali (বাংলা)
   - Tamil (தமிழ்)
   - Telugu (తెలుగు)
   - Marathi (मराठी)
   - Gujarati (ગુજરાતી)

---

## 2. Architecture & Technology Stack

```
sahayak-ai/
├── backend/
│   ├── config/
│   │   └── db.js            # PostgreSQL pool + resilient storage engine
│   ├── controllers/
│   │   ├── authController.js       # JWT auth & profile settings
│   │   ├── consultController.js    # Multimodal Gemini routing
│   │   ├── scamController.js       # Threat detection & community alerts
│   │   ├── grievanceController.js  # Official legal grievance drafter
│   │   └── historyController.js    # Row-Level user data isolation
│   ├── middleware/
│   │   ├── auth.js          # JWT Bearer verification
│   │   ├── validate.js      # Zod request validators
│   │   └── upload.js        # Multer 10MB images / 25MB audio
│   ├── routes/
│   ├── services/
│   │   ├── geminiService.js # @google/genai SDK (gemini-2.5-flash)
│   │   └── schema.sql       # Production PostgreSQL DDL
│   ├── server.js            # Express server entry point
│   ├── .env                 # Environment secrets
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation + Helpline 1930 ribbon
│   │   │   ├── MultimodalInputHub.jsx   # Photo upload, live audio recording, STT
│   │   │   ├── RiskBadge.jsx            # Low/Med/High/Critical risk visualizer
│   │   │   ├── ActionPlanCard.jsx       # Step-by-step accordion + TTS audio
│   │   │   ├── ComplaintDraftViewer.jsx # Legal petition view + copy + download
│   │   │   ├── HumanApprovalModal.jsx   # Mandatory confirmation gate
│   │   │   └── ProtectedRoute.jsx       # JWT route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # User session management
│   │   │   └── LanguageContext.jsx      # Vernacular localization state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx          # Hero, quick actions, live alerts ticker
│   │   │   ├── LoginPage.jsx            # Secure sign in
│   │   │   ├── RegisterPage.jsx         # Sign up with language preference
│   │   │   ├── DashboardPage.jsx        # Metrics, recent queries, shortcuts
│   │   │   ├── ConsultPage.jsx          # Multimodal advisory workspace
│   │   │   ├── ScamShieldPage.jsx       # Dedicated message/URL/phone scanner
│   │   │   ├── RecoursePage.jsx         # Legal grievance generator & submitter
│   │   │   ├── HistoryPage.jsx          # User records with filter & modal viewer
│   │   │   └── ProfilePage.jsx          # Regional settings & verified helplines
│   │   ├── services/api.js              # Axios with JWT bearer interceptors
│   │   ├── utils/
│   │   │   ├── translations.js          # Full 7-language UI dictionary
│   │   │   └── speech.js                # Web Speech API (TTS & STT)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 3. Database Schema (PostgreSQL 14+)

The backend executes and strictly conforms to the following production SQL schema:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    preferred_language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(100) NOT NULL,
    input_type VARCHAR(50) NOT NULL,
    raw_input TEXT,
    media_url TEXT,
    ai_response JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scam_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    suspect_identifier VARCHAR(255) NOT NULL,
    scam_type VARCHAR(100) NOT NULL,
    risk_score INTEGER NOT NULL,
    analysis_details JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    incident_summary TEXT NOT NULL,
    complaint_draft TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consultations_user ON consultations(user_id);
CREATE INDEX idx_scam_reports_user ON scam_reports(user_id);
CREATE INDEX idx_grievances_user ON grievances(user_id);
```

---

## 4. Environment Configuration

### Backend `.env` (`backend/.env`):
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sahayak_db
JWT_SECRET=super_secret_jwt_key_change_in_production_sahayak_2026_secure
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```

### Frontend `.env` (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Quickstart & Installation

### Step 1: Install Dependencies
```bash
# In the backend directory:
cd backend
npm install

# In the frontend directory:
cd ../frontend
npm install
```

### Step 2: Start the Backend Server
```bash
cd backend
npm start
# Server listens on http://localhost:5000
```

### Step 3: Start the Frontend Application
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 4: Access in Browser
Open `http://localhost:5173` to explore the platform:
- Switch languages with the language picker at the top.
- Test suspicious messages in **Scam Shield**.
- Upload a crop photo or record a voice note in **Ask Sahayak**.
- Draft an official complaint in **File Grievance** with human approval confirmation.

---

## 6. API Reference

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register citizen account with language preference | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `PUT` | `/api/auth/profile` | Update user name, phone, language | Yes |
| `POST` | `/api/consult` | Multimodal query (multipart/form-data) via Gemini 2.5 Flash | Yes |
| `POST` | `/api/scam-shield/check` | Analyze suspicious message/number for scam risk | Yes |
| `GET` | `/api/scam-shield/alerts` | Public live community scam alert feed | No |
| `POST` | `/api/grievance/generate`| Generate formal complaint letter draft | Yes |
| `POST` | `/api/grievance/submit` | Human-in-the-loop approved official submission | Yes |
| `GET` | `/api/history` | Retrieve user consultation & report history | Yes |
| `GET` | `/api/health` | Health check & model status | No |

---

## 7. Security & Row-Level Data Isolation
- **Authentication**: JWT signed with secret and 7-day expiration; password hashed with bcrypt with 10 salt rounds.
- **Data Isolation**: All queries to `consultations`, `scam_reports`, and `grievances` are strictly scoped by `WHERE user_id = req.user.id`.
- **Validation**: Strict Zod schemas sanitize all incoming inputs.
- **Rate Limiting**: Protects authentication and AI endpoints from automated abuse.
