# 🐄 AgroAI — Жылыжай Мал Есебі Веб-Жүйесі

<div align="center">

![AgroAI Banner](https://img.shields.io/badge/AgroAI-v1.0.0-2e7d32?style=for-the-badge&logo=leaf&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Жасанды интеллект көмегімен мал басын есепке алу және талдау веб-жүйесі**  
*AI-powered livestock management & analytics platform for greenhouse farming*

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [API Docs](#api-docs) • [Contributing](#contributing)

</div>

---

## 📋 Мазмұны / Table of Contents

- [Жүйе туралы / Overview](#overview)
- [Мүмкіндіктер / Features](#features)
- [Технологиялар / Tech Stack](#tech-stack)
- [Орнату / Installation](#installation)
- [Қолдану / Usage](#usage)
- [API Документация / API Docs](#api-docs)
- [Қатысу / Contributing](#contributing)

---

## 🌿 Overview

**AgroAI** — жылыжай шаруашылығы саласына арналған толық стек веб-жүйе. YOLOv8 нейрондық желісі арқылы мал санауды 94.7% дәлдікпен автоматтандырады. Ішінде **ЖИ Чат-боты** бар — техникалық қолдау, мал ауруы туралы ақпарат, жүйені қолдану нұсқаулары.

### 🤖 Built-in AI Support Chatbot
The system includes a fully integrated AI chatbot powered by Anthropic Claude API that:
- Answers questions about livestock diseases and symptoms
- Helps navigate the web system
- Provides veterinary advice (disclaimer included)
- Supports Kazakh 🇰🇿, Russian 🇷🇺, and English 🇬🇧
- Works 24/7 as a first-line support agent

---

## ✨ Features

| Модуль | Сипаттама | Status |
|--------|-----------|--------|
| 🐄 **Мал тіркеу** | RFID/QR тег, топтық импорт, генеалогия | ✅ Ready |
| 🤖 **ЖИ Санау** | YOLOv8 автоматты санау, бейне талдау | ✅ Ready |
| ❤️ **Денсаулық** | Ауру тану, вакцинация, ескерту | ✅ Ready |
| 📊 **Аналитика** | Dashboard, диаграммалар, KPI | ✅ Ready |
| 🗺️ **GPS Карта** | Leaflet, геофенсинг, трекинг | ✅ Ready |
| 📋 **Есептілік** | PDF/Excel автоматты есептер | ✅ Ready |
| 💬 **ЖИ Чат-бот** | Claude API, 24/7 техқолдау | ✅ Ready |
| 🔔 **Хабарламалар** | Email, Telegram Bot | ✅ Ready |

---

## 🛠 Tech Stack

### Backend
- **FastAPI** 0.104 — Python async REST API
- **SQLAlchemy** 2.0 — ORM + async engine
- **PostgreSQL** 16 — Primary database
- **Redis** 7.2 — Caching + sessions
- **Ultralytics YOLOv8** — Object detection
- **Anthropic Claude API** — AI chatbot

### Frontend
- **React** 18.2 + **Vite** 5.0
- **Tailwind CSS** 3.4
- **Recharts** 2.10 — Charts
- **Leaflet.js** — Maps
- **Axios** + **React Query**

### Infrastructure
- **Docker** + **Docker Compose**
- **Nginx** — Reverse proxy
- **Alembic** — DB migrations

---

## 🚀 Installation

### Prerequisites
- Docker & Docker Compose installed
- Anthropic API Key (for chatbot): [Get here](https://console.anthropic.com/)

### Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/agroai.git
cd agroai

# 2. Copy environment variables
cp .env.example .env

# 3. Edit .env — add your API keys
nano .env

# 4. Build and run
docker-compose up --build

# 5. Open browser
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
# Admin Panel: http://localhost:8000/admin
```

### Manual Setup (Development)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Create `.env` file from `.env.example`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://agroai:password@db:5432/agroai_db

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=your-super-secret-256-bit-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Anthropic Claude API (for chatbot)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your-app-password

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-bot-token
```

---

## 📖 API Docs

After running the server, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Get JWT token |
| GET | `/api/v1/livestock` | List all livestock |
| POST | `/api/v1/livestock` | Register new animal |
| POST | `/api/v1/ai/detect` | AI livestock counting |
| POST | `/api/v1/chat` | AI chatbot message |
| GET | `/api/v1/reports/pdf` | Generate PDF report |
| GET | `/api/v1/farms/map` | GeoJSON farm data |

---

## 🗂 Project Structure

```
agroai/
├── 📁 backend/
│   ├── main.py                 # FastAPI app entry
│   ├── requirements.txt
│   ├── 📁 routers/
│   │   ├── auth.py             # JWT authentication
│   │   ├── livestock.py        # Livestock CRUD
│   │   ├── ai_detection.py     # YOLOv8 detection
│   │   ├── chat.py             # AI chatbot (Claude)
│   │   ├── health.py           # Health records
│   │   └── reports.py          # PDF/Excel reports
│   ├── 📁 models/
│   │   ├── database.py         # SQLAlchemy models
│   │   └── schemas.py          # Pydantic schemas
│   └── 📁 services/
│       ├── ai_service.py       # YOLOv8 inference
│       ├── chat_service.py     # Claude chatbot
│       └── report_service.py   # Report generation
├── 📁 frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── 📁 src/
│       ├── App.jsx             # Root component
│       ├── main.jsx
│       ├── 📁 components/
│       │   ├── ChatBot.jsx     # 💬 AI Chat widget
│       │   ├── Navbar.jsx
│       │   ├── StatsCard.jsx
│       │   └── LivestockTable.jsx
│       └── 📁 pages/
│           ├── Dashboard.jsx
│           ├── Livestock.jsx
│           ├── AIDetection.jsx
│           ├── Health.jsx
│           ├── Map.jsx
│           └── Reports.jsx
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🤝 Contributing

```bash
# Fork → Clone → Branch → Commit → PR
git checkout -b feature/your-feature
git commit -m "feat: add amazing feature"
git push origin feature/your-feature
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

<div align="center">
Made with ❤️ for Kazakh farmers 🇰🇿 | AgroAI Team 2024
</div>
