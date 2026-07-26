from fastapi import APIRouter, HTTPException,Depends
from auth.dependencies import get_current_user

from services.review_service import ReviewService

from schemas.review import ReviewResponse

router = APIRouter()

service = ReviewService()


@router.get(
    "/review/{exam_id}",
    response_model=ReviewResponse,
)
def get_review(
    exam_id: str,
    current_user=Depends(get_current_user),
):

    review = service.get_review(
    exam_id,
    current_user["id"],
    )

    if review is None:

        raise HTTPException(
            status_code=404,
            detail="Review not found.",
        )

    return review