from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request
)

from auth.dependencies import get_current_user

from core.security.rate_limit import limiter

from schemas.exam import (
    GenerateExamRequest,
    GenerateExamResponse,
    ExamSession,
    SaveAnswerRequest,
    MarkReviewRequest,
    SubmitExamResponse
)

from services.exam_service import ExamService

router = APIRouter()

service = ExamService()


@router.post(
    "/exam/generate",
    response_model=GenerateExamResponse,
)
@limiter.limit("30/minute")
def generate_exam(
    request: Request,
    body : GenerateExamRequest,
    current_user=Depends(get_current_user),
):

    unfinished = service.has_unfinished_exam(
    current_user["id"]
    )

    if unfinished is not None:
        return {
            "success": False,
            "unfinishedExam": True,
            "examId": unfinished["examId"],
        }

    return service.generate_exam(
    user_id=current_user["id"],
    question_count=body.questionCount,
    timed=body.timed,
    duration_minutes=body.durationMinutes,
    )

@router.get("/exam/current")
def get_current_exam(
    current_user=Depends(get_current_user),
):

    exam = service.get_current_exam(
    current_user["id"]
    )

    return {
        "exists": exam is not None,
        "exam": exam,
    }


@router.get(
    "/exam/{exam_id}",
    response_model=ExamSession,
)
def get_exam(
    exam_id: str,
    current_user=Depends(get_current_user),
):

    exam = service.get_exam(
    exam_id,
    current_user["id"],
    )

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    return exam

@router.post("/exam/{exam_id}/answer")
def save_answer(
    exam_id: str,
    request: SaveAnswerRequest,
    current_user=Depends(get_current_user),
):

    try:
        session = service.save_answer(
            exam_id,
            current_user["id"],
            request.questionId,
            request.selectedOption,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    return {
        "success": True,
    }

@router.post("/exam/{exam_id}/review")
def mark_for_review(
    exam_id: str,
    request: MarkReviewRequest,
    current_user=Depends(get_current_user),
):

    session = service.mark_for_review(
        exam_id,
        current_user["id"],
        request.questionId,
        request.marked,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    return {
        "success": True,
    }

@router.post(
    "/exam/{exam_id}/submit",
    response_model=SubmitExamResponse,
)
def submit_exam(exam_id: str,current_user=Depends(get_current_user)):

    result = service.submit_exam(
    exam_id,
    current_user["id"],
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Exam not found.",
        )

    return result

@router.get("/exam/unfinished")
def unfinished_exam(current_user=Depends(get_current_user)):

    exam = service.has_unfinished_exam(
    current_user["id"]
    )

    return {
        "exists": exam is not None,
        "exam": exam,
    }


@router.delete("/exam/{exam_id}")
def delete_exam(exam_id: str,current_user=Depends(get_current_user)):

    return service.delete_exam(
    exam_id,
    current_user["id"],
    )
