from pydantic import BaseModel


class DashboardResponse(BaseModel):
    currentExam: dict | None
    currentPractice: dict | None
    banks: list
    examsTaken: int