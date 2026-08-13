from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.question_bank import router as question_bank_router
from api.extraction import router as extraction_router
from api.progress import router as progress_router
from api.exam import router as exam_router
from api import history
from api import review
from api.practice import router as practice_router
from api.auth import router as auth_router
from slowapi.middleware import SlowAPIMiddleware
from core.security.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler




app = FastAPI()
app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


app.add_middleware(
    SlowAPIMiddleware
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }

app.include_router(auth_router)
app.include_router(question_bank_router)
app.include_router(extraction_router)
app.include_router(progress_router)
app.include_router(exam_router)
app.include_router(history.router)
app.include_router(review.router)
app.include_router(practice_router)