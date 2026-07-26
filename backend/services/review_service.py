from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.database import SessionLocal
from database.models import (
    Exam,
    ExamAnswer,
    Question,
    QuestionBank,
)


class ReviewService:

    # ==================================================
    # Complete Review Data
    # ==================================================

    def get_review(
    self,
    exam_id: str,
    user_id: str,
    ):

        db = SessionLocal()

        try:

            # ------------------------------------------
            # Load completed exam + answers
            # ------------------------------------------

            statement = (
                select(Exam)
                .options(
                    selectinload(
                        Exam.answers
                    )
                )
                .where(
                    Exam.id == exam_id,
                    Exam.user_id == user_id,
                    Exam.status == "completed",
                )
            )
            exam = db.scalar(
                statement
            )

            if exam is None:
                return None

            # ------------------------------------------
            # Question Bank
            # ------------------------------------------

            bank = db.get(
                QuestionBank,
                exam.question_bank_id,
            )

            # ------------------------------------------
            # Preserve Exam Question Order
            # ------------------------------------------

            answers_sorted = sorted(
                exam.answers,
                key=lambda answer:
                    answer.position,
            )

            question_ids = [
                answer.question_id
                for answer
                in answers_sorted
            ]

            if question_ids:

                questions = list(
                    db.scalars(
                        select(Question)
                        .where(
                            Question.id.in_(
                                question_ids
                            )
                        )
                    ).all()
                )

            else:

                questions = []

            question_map = {
                question.id: question
                for question in questions
            }

            # ------------------------------------------
            # Build Review Questions
            # ------------------------------------------

            review_questions = []

            for index, answer in enumerate(
                answers_sorted
            ):

                question = (
                    question_map.get(
                        answer.question_id
                    )
                )

                if question is None:
                    continue

                options = {
                    "A":
                        question.option_a,

                    "B":
                        question.option_b,

                    "C":
                        question.option_c,

                    "D":
                        question.option_d,
                }

                correct_answer = (
                    question.correct_answer
                )

                correct_option = (
                    options.get(
                        correct_answer
                    )
                    if correct_answer
                    else None
                )

                user_answer = (
                    answer.selected_option
                )

                review_questions.append(
                    {
                        "id":
                            question.id,

                        "index":
                            index,

                        "question":
                            question.question_text,

                        "options":
                            options,

                        "userAnswer":
                            user_answer,

                        "correctAnswer":
                            correct_answer,

                        "correctOption":
                            correct_option,

                        "marked":
                            answer.marked_for_review,

                        "explanation":
                            question.explanation
                            or "",

                        "isCorrect": (
                            answer.is_correct
                            is True
                        ),

                        "isSkipped": (
                            user_answer
                            is None
                        ),
                    }
                )

            # ------------------------------------------
            # Calculate Summary
            # ------------------------------------------

            correct = sum(
                1
                for answer
                in exam.answers
                if answer.is_correct
                is True
            )

            wrong = sum(
                1
                for answer
                in exam.answers
                if (
                    answer.selected_option
                    is not None
                    and answer.is_correct
                    is False
                )
            )

            unanswered = sum(
                1
                for answer
                in exam.answers
                if answer.selected_option
                is None
            )

            total = len(
                exam.answers
            )

            # ------------------------------------------
            # Summary
            # ------------------------------------------

            summary = {
                "examId":
                    exam.id,

                "questionBank": (
                    bank.file_name
                    if bank
                    else "Unknown"
                ),

                "mode": (
                    "Timed"
                    if exam.timed
                    else "Practice"
                ),

                "questionCount":
                    total,

                "correct":
                    correct,

                "wrong":
                    wrong,

                "unanswered":
                    unanswered,

                "percentage": (
                    exam.percentage
                    if exam.percentage
                    is not None
                    else 0
                ),

                "completedAt": (
                    exam.completed_at.isoformat()
                    if exam.completed_at
                    else None
                ),

                "startedAt": (
                    exam.started_at.isoformat()
                    if exam.started_at
                    else None
                ),

                "timed":
                    exam.timed,

                "durationMinutes":
                    exam.duration_minutes,
            }

            # ------------------------------------------
            # Final Response
            # ------------------------------------------

            return {
                "examId":
                    exam.id,

                "summary":
                    summary,

                "questions":
                    review_questions,
            }

        finally:

            db.close()