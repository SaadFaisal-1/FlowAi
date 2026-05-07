# FlowMind — AI Workflow Builder

A visual, canvas-based workflow automation tool for Pakistani SMEs.  
Built with **FastAPI** (backend) + **React + Vite** (frontend, dark dashboard UI).

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/flowmind.git
cd flowmind
```

### 2. Backend setup (Terminal 1)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Create your .env file
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
# Edit .env and fill in your API keys

uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 3. Frontend setup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🌐 Deployment

### Backend → Render (free)
1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables from `.env.example`
7. Deploy → copy the URL (e.g. `https://flowmind-backend.onrender.com`)

### Frontend → Vercel (free)
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo, set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy

---

## 📁 Project Structure

```
flowmind/
├── backend/
│   ├── main.py              # FastAPI app, all routes
│   ├── database.py          # SQLite (local) / PostgreSQL (Render)
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response types
│   ├── workflow_engine.py   # Core: executes node graphs
│   ├── llm.py               # GPT-4o-mini AI node
│   ├── integrations/
│   │   ├── whatsapp.py      # Meta Cloud API
│   │   ├── gmail.py         # Gmail OAuth2
│   │   ├── sheets.py        # Google Sheets (gspread)
│   │   └── calendar.py      # Google Calendar API
│   ├── requirements.txt
│   ├── render.yaml          # Render deployment config
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api.ts           # All API calls to backend
    │   └── app/
    │       ├── pages/       # Dashboard, WorkflowBuilder, Logs etc.
    │       └── components/  # Layout, Canvas, NodePalette etc.
    ├── vercel.json          # Vercel SPA routing config
    └── vite.config.ts       # Dev proxy → backend :8000
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | From platform.openai.com |
| `WA_PHONE_NUMBER_ID` | From Meta Developer Console |
| `WA_ACCESS_TOKEN` | Meta permanent token |
| `WA_VERIFY_TOKEN` | Any random string |
| `GOOGLE_CREDENTIALS_JSON` | Service account JSON (one line) |
| `FRONTEND_URL` | Your Vercel URL (for CORS) |

---

## 👥 Team
- **AW** — Backend, Workflow Engine, Integrations  
- **SF** — Frontend, Canvas UI, API wiring
