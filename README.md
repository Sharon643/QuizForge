MockDoc — PDF Quiz & Exam Platform

MockDoc is a full-stack quiz platform that turns question-bank PDFs into interactive practice sessions and mock exams. It is designed for students who want to study from their own question material instead of manually creating quizzes.

Features
📄 PDF Question Bank Upload — Upload a PDF containing MCQs and extract questions into the platform.
📝 Practice Mode — Practice questions individually and immediately see whether your answer is correct.
🏆 Exam Mode — Create a randomized mock exam with configurable question count and timing.
📊 Exam Results — View your score and performance after completing an exam.
📚 Question Banks — Manage extracted question banks.
🕒 History — Review previous exam attempts and performance.
🔐 Authentication — User accounts and authenticated API requests.
⚡ Responsive UI — React-based interface designed for desktop and mobile use.
Tech Stack
Frontend
React
TypeScript
Vite
React Router
Axios
Tailwind CSS
Supabase Auth
Backend
Python
FastAPI
SQLAlchemy
Pydantic
SlowAPI
Uvicorn
Database & Services
PostgreSQL
Supabase
Render
Architecture
                    ┌──────────────────┐
                    │     React UI     │
                    │  TypeScript/Vite │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │     FastAPI      │
                    │     Backend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Supabase     │
                    │   PostgreSQL DB  │
                    └──────────────────┘

The frontend communicates with the FastAPI backend through REST endpoints, while Supabase PostgreSQL stores application data.

Project Structure
mockdoc/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── lib/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    ├── api/
    ├── auth/
    ├── core/
    ├── schemas/
    ├── services/
    ├── main.py
    └── requirements.txt
Getting Started
Prerequisites

Make sure you have installed:

Node.js
Python 3.11+
Git
A Supabase project
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
2. Setup the backend
cd backend


python -m venv venv

Activate the virtual environment.

Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create a .env file with your backend environment variables.

Start the API:

uvicorn main:app --reload

The API will run at:

http://127.0.0.1:8000

FastAPI documentation is available at:

http://127.0.0.1:8000/docs
3. Setup the frontend
cd frontend
npm install

Create a .env file:

VITE_API_URL=http://127.0.0.1:8000

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
Environment Variables
Frontend
VITE_API_URL=
Backend

Add the required Supabase, authentication, AI, and application configuration variables to the backend .env file.

Never commit .env files or API keys to GitHub.

API

The backend exposes REST endpoints for functionality including:

/auth
/question-banks
/practice
/exam
/history
/health

The health endpoint can be used to verify that the backend is running:

GET /health

Response:

{
  "status": "ok"
}
Deployment

The current deployment architecture uses:

React Frontend
      │
      ▼
   Render
      │
      ▼
FastAPI Backend
      │
      ▼
Supabase PostgreSQL

The frontend uses the VITE_API_URL environment variable so the same codebase can be used for both local development and production.

Production API
VITE_API_URL=https://mockdoc-lx2q.onrender.com
Security
Authentication tokens are sent through the Authorization header.
API requests are authenticated on the backend.
Rate limiting is implemented using SlowAPI.
Secrets and API keys are stored through environment variables.
Production CORS is restricted to the deployed frontend rather than allowing arbitrary origins.
Future Improvements

Planned improvements for turning MockDoc into a larger SaaS platform include:

💳 Subscription and payment system
☁️ Persistent PDF/object storage
⚙️ Background PDF/AI processing
📈 Advanced learning analytics
🔔 Processing status notifications
👥 Improved multi-user isolation
🚀 Scalable worker architecture
📱 Progressive Web App / mobile support
Status

🚀 V1 — Deployment

The core quiz workflow is implemented, including authentication, question banks, practice mode, exam mode, results, and history. The application is currently being prepared for production deployment.

License

This project is currently for educational and portfolio purposes. Add a license here if you decide to open-source the project.
