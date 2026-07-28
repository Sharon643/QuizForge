from fastapi import APIRouter, HTTPException,Depends
from auth.dependencies import get_current_user

from services.practice_service import PracticeService

from schemas.practice import (
    StartPracticeRequest,
    SubmitPracticeAnswerRequest,
)

router = APIRouter(prefix="/practice", tags=["Practice"])

service = PracticeService()

@router.post("/start")
def start_practice(
    request: StartPracticeRequest,
    current_user=Depends(get_current_user),
):
    return service.start_practice(
    current_user["id"],
    request.questionCount,
    request.questionBankId,
    )

@router.get("/current")
def get_current_practice(
    current_user=Depends(get_current_user),
):

    return service.get_current_practice(
        current_user["id"]
    )

@router.get("/{practice_id}")
def get_practice(
    practice_id: str,
    current_user=Depends(get_current_user)
):
    session = service.get_practice(
    practice_id,
    current_user["id"],
)

    if session is None:
        raise HTTPException(
            404,
            "Practice not found",
        )

    return session

@router.post("/{practice_id}/answer")
def submit_answer(
    practice_id: str,
    request: SubmitPracticeAnswerRequest,
    current_user=Depends(get_current_user)
):
    return service.submit_answer(
    practice_id,
    current_user["id"],
    request.questionId,
    request.selectedOption,
)

@router.post("/{practice_id}/finish")
def finish_practice(
    practice_id: str,
    current_user=Depends(get_current_user)
):
    return service.finish_practice(
    practice_id,
    current_user["id"],
)

