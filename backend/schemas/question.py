from pydantic import BaseModel
from typing import Optional


class UpdateAnswerRequest(BaseModel):
    correct_answer: str
    explanation: Optional[str] = None