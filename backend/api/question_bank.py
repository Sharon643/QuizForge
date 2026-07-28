from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
)

from auth.dependencies import (
    get_current_user,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import Question, QuestionBank

from utils.question_bank import QuestionBankManager
from services.answer_generator import AnswerGenerator
from schemas.question import UpdateAnswerRequest


router = APIRouter()


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def serialize_question(question: Question):

    return {
        "id": question.id,
        "number": question.number,
        "page": question.page,
        "subject": question.subject,
        "question": question.question_text,
        "options": {
            "A": question.option_a,
            "B": question.option_b,
            "C": question.option_c,
            "D": question.option_d,
        },
        "correct_answer": question.correct_answer,
        "answer_source": question.answer_source,
        "confidence": question.answer_confidence,
        "explanation": question.explanation,
    }


def get_bank_questions(
    db: Session,
    bank_id: str,
):

    statement = (
        select(Question)
        .where(
            Question.question_bank_id
            == bank_id
        )
    )

    return list(
        db.scalars(statement).all()
    )


# --------------------------------------------------
# Active Question Bank
# --------------------------------------------------

@router.get("/question-bank")
def get_question_bank(
    current_user=Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        manager = QuestionBankManager(db)

        active_bank = (
            manager.get_active_bank(
                current_user["id"]
            )
        )

        if active_bank is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "No active question "
                    "bank found."
                ),
            )

        questions = get_bank_questions(
            db,
            active_bank["id"],
        )

        subjects = len(
            {
                question.subject
                for question in questions
                if question.subject
            }
        )

        return {
            "id": active_bank["id"],
            "fileName": active_bank["fileName"],
            "questionCount": len(questions),
            "subjects": subjects,
            "uploadedAt": active_bank["uploadedAt"],
            "lastModified": active_bank["lastModified"],
            "active": active_bank["active"],
            "hasQuestions": len(questions) > 0,
        }

    finally:

        db.close()


# --------------------------------------------------
# Active Bank Questions
# --------------------------------------------------

@router.get("/question-bank/questions")
def get_questions(
    current_user=Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        manager = QuestionBankManager(db)

        active_bank = (
            manager.get_active_bank(
                current_user["id"]
            )
        )

        if active_bank is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "No active question "
                    "bank found."
                ),
            )

        questions = get_bank_questions(
            db,
            active_bank["id"],
        )

        return {
            "count": len(questions),
            "questions": [
                serialize_question(question)
                for question in questions
            ],
        }

    finally:

        db.close()


# --------------------------------------------------
# All Question Banks
# --------------------------------------------------

@router.get("/question-banks")
def get_all_question_banks(
    current_user=Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        manager = QuestionBankManager(db)

        banks = manager.get_all_banks(current_user["id"])

        return {
            "count": len(banks),
            "banks": banks,
        }

    finally:

        db.close()


# --------------------------------------------------
# Select Question Bank
# --------------------------------------------------

@router.post(
    "/question-banks/{bank_id}/select"
)
def select_question_bank(
    bank_id: str,

    current_user=Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        manager = QuestionBankManager(db)

        success = (
            manager.set_active_bank(
                bank_id,
                current_user["id"],
            )
        )
        

        if not success:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Question bank "
                    "not found."
                ),
            )

        return {
            "success": True,
            "message": (
                "Question bank selected "
                "successfully."
            ),
        }

    finally:

        db.close()


# --------------------------------------------------
# Delete Question Bank
# --------------------------------------------------

@router.delete(
    "/question-banks/{bank_id}"
)
def delete_question_bank(
    bank_id: str,

    current_user=Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        manager = QuestionBankManager(db)

        success = (
            manager.delete_bank(
                bank_id,
                current_user["id"],
            )
        )
        

        if not success:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Question bank "
                    "not found."
                ),
            )

        return {
            "success": True,
            "message": (
                "Question bank deleted "
                "successfully."
            ),
        }

    finally:

        db.close()


# --------------------------------------------------
# Questions For Specific Bank
# --------------------------------------------------

@router.get(
    "/question-banks/{bank_id}/questions"
)
def get_question_bank_questions(
    bank_id: str,

    current_user=Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        bank = db.scalar(
            select(QuestionBank)
            .where(
                QuestionBank.id
                == bank_id,

                QuestionBank.user_id
                == current_user["id"],
            )
        )

        if bank is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Question bank "
                    "not found."
                ),
            )

        questions = get_bank_questions(
            db,
            bank_id,
        )

        return {
            "count": len(questions),
            "questions": [
                serialize_question(question)
                for question in questions
            ],
        }

    finally:

        db.close()


# --------------------------------------------------
# Generate AI Answers
# --------------------------------------------------

@router.post(
    "/question-banks/{bank_id}/generate-answers"
)
def generate_answers(
    bank_id: str,

    current_user=Depends(
        get_current_user
    ),
):

    db = SessionLocal()

    try:

        bank = db.get(
            QuestionBank,
            bank_id,
        )

        if bank is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Question bank "
                    "not found."
                ),
            )

        db_questions = (
            get_bank_questions(
                db,
                bank_id,
            )
        )

        if not db_questions:

            raise HTTPException(
                status_code=404,
                detail=(
                    "No questions found "
                    "for this question bank."
                ),
            )

        # Convert database models into
        # the canonical format expected
        # by AnswerGenerator.

        questions = [
            serialize_question(question)
            for question in db_questions
        ]

        generator = (
            AnswerGenerator()
        )

        stats = generator.generate(
            questions
        )

        # Map generated answers back
        # to database questions.

        generated_map = {
            question["id"]: question
            for question in questions
        }

        for db_question in db_questions:

            generated = (
                generated_map.get(
                    db_question.id
                )
            )

            if generated is None:
                continue

            db_question.correct_answer = (
                generated.get(
                    "correct_answer"
                )
            )

            db_question.answer_confidence = (
                generated.get(
                    "confidence"
                )
            )

            db_question.explanation = (
                generated.get(
                    "explanation"
                )
            )

            db_question.answer_source = (
                generated.get(
                    "answer_source"
                )
            )

        db.commit()

        return {
            "success": True,
            **stats,
        }

    except HTTPException:

        raise

    except Exception:

        db.rollback()

        raise

    finally:

        db.close()

@router.patch("/questions/{question_id}/answer")
def update_answer(
    question_id: str,
    payload: UpdateAnswerRequest,
    current_user=Depends(get_current_user),
):
    db = SessionLocal()

    try:

        question = db.get(
            Question,
            question_id,
        )

        if question is None:
            raise HTTPException(
                status_code=404,
                detail="Question not found.",
            )

        bank = db.get(
            QuestionBank,
            question.question_bank_id,
        )

        if (
            bank is None
            or bank.user_id != current_user["id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="Access denied.",
            )

        question.correct_answer = (
            payload.correct_answer
        )

        question.explanation = (
            payload.explanation
        )

        question.answer_source = "manual"

        question.answer_confidence = 1.0

        db.commit()
        db.refresh(question)

        return {
            "success": True,
            "question": serialize_question(question),
        }

    finally:
        db.close()