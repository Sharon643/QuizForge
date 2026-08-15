# MockDoc — PDF Quiz & Exam Platform

MockDoc is a full-stack quiz platform that turns question-bank PDFs into interactive practice sessions and mock exams.

## Features

* 📄 **PDF Question Bank Upload** — Upload a PDF containing MCQs and extract questions.
* 📝 **Practice Mode** — Practice questions individually and see whether your answer is correct.
* 🏆 **Exam Mode** — Create randomized mock exams with configurable question count and timing.
* 📊 **Exam Results** — View your score and performance after completing an exam.
* 📚 **Question Banks** — Manage extracted question banks.
* 🕒 **History** — Review previous exam attempts and performance.
* 🔐 **Authentication** — User accounts and authenticated API requests.
* ⚡ **Responsive UI** — React-based interface.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* Tailwind CSS
* Supabase Auth

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* SlowAPI
* Uvicorn

### Database & Services

* PostgreSQL
* Supabase
* Render

## Architecture

```text
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
```

## Project Structure

```text
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
```

## Getting Started

### Prerequisites

* Node.js
* Python 3.11+
* Git
* A Supabase project

### Backend

```bash
cd backend
python -m venv venv
```

**Windows:**

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file with the required backend environment variables.

Start the API:

```bash
uvicorn main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the development server:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Environment Variables

### Frontend

```env
VITE_API_URL=
```

### Backend

Add the required Supabase, authentication, AI, and application configuration variables to the backend `.env` file.

**Never commit `.env` files or API keys to GitHub.**

## API

The backend exposes endpoints for functionality including:

```text
/auth
/question-banks
/practice
/exam
/history
/health
```

Health check:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

## Deployment

The deployment architecture uses:

```text
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
```

The frontend uses `VITE_API_URL` so the same codebase can be used locally and in production.

### Production API

```env
VITE_API_URL=https://mockdoc-lx2q.onrender.com
```

## Security

* Authentication tokens are sent through the `Authorization` header.
* API requests are authenticated on the backend.
* Rate limiting is implemented using SlowAPI.
* Secrets and API keys are stored through environment variables.
* Production CORS is restricted to the deployed frontend.

## Future Improvements

* 💳 Subscription and payment system
* ☁️ Persistent PDF/object storage
* ⚙️ Background PDF/AI processing
* 📈 Advanced learning analytics
* 🔔 Processing status notifications
* 👥 Improved multi-user isolation
* 🚀 Scalable worker architecture
* 📱 Progressive Web App / mobile support

## Status

🚀 **V1 — Deployment**

The core quiz workflow is implemented, including authentication, question banks, practice mode, exam mode, results, and history.

## License

This project is currently for educational and portfolio purposes. Add a license if you decide to open-source the project.
