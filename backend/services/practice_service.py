import random
from fastapi import HTTPException

from datetime import datetime, UTC

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.database import SessionLocal
from database.models import (
    PracticeSession,
    PracticeAnswer,
    Question,
    QuestionBank,
)


class PracticeService:

    # ==================================================
    # Helpers
    # ==================================================

    def _serialize_question(
        self,
        question: Question,
    ):

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

            # Practice mode needs these immediately
            # after the user answers.
            "correct_answer":
                question.correct_answer,

            "explanation":
                question.explanation or "",
        }

    def _get_session(
    self,
    db,
    practice_id,
    user_id,
    ):

        statement = (
            select(
                PracticeSession
            )
            .options(
                selectinload(
                    PracticeSession.answers
                )
            )
            .where(
            PracticeSession.id == practice_id,
            PracticeSession.user_id == user_id,
        )
        )

        return db.scalar(
            statement
        )

    def _serialize_session(
        self,
        db,
        session: PracticeSession,
    ):

        # Sort selected questions using
        # their saved random position.

        answers_sorted = sorted(
            session.answers,
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
                    select(
                        Question
                    )
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

        serialized_questions = []

        answers = {}

        for answer in answers_sorted:

            question = (
                question_map.get(
                    answer.question_id
                )
            )

            if question:

                serialized_questions.append(
                    self._serialize_question(
                        question
                    )
                )

            if (
                answer.selected_option
                is not None
            ):

                answers[answer.question_id] = {
                    "selectedOption": answer.selected_option,
                    "isCorrect": answer.is_correct,
                    "correctAnswer": (
                        question.correct_answer
                        if question
                        else None
                    ),
                    "explanation": (
                        question.explanation
                        if question
                        else ""
                    ),
                }

        bank = db.get(
            QuestionBank,
            session.question_bank_id,
        )

        return {
            "practiceId":
                session.id,

            "questionBank": (
                bank.file_name
                if bank
                else "Unknown"
            ),

            "questionCount":
                len(
                    serialized_questions
                ),

            "startedAt":
                session.started_at.isoformat(),

            "questions":
                serialized_questions,

            "answers":
                answers,
        }

    # ==================================================
    # Start Practice
    # ==================================================

    def start_practice(
    self,
    user_id: str,
    question_count: int,
    question_bank_id: str | None,
    ):

        db = SessionLocal()

        try:

            # ------------------------------------------
            # Get Question Bank
            # ------------------------------------------

            if question_bank_id:

                bank = db.scalar(
                    select(QuestionBank)
                    .where(
                        QuestionBank.id == question_bank_id,
                        QuestionBank.user_id == user_id,
                    )
                )

            else:

                bank = db.scalar(
                    select(
                        QuestionBank
                    )
                    .where(
                        QuestionBank.user_id == user_id,
                        QuestionBank.active.is_(True),
                    )
                    .limit(1)
                )

            if bank is None:

                raise ValueError(
                    "Question bank "
                    "not found."
                )

            # ------------------------------------------
            # Load Questions
            # ------------------------------------------

            questions = list(
                db.scalars(
                    select(
                        Question
                    )
                    .where(
                        Question
                        .question_bank_id
                        == bank.id
                    )
                ).all()
            )

            if not questions:

                raise ValueError(
                    "Question bank "
                    "contains no questions."
                )

            random.shuffle(
                questions
            )

            selected = questions[
                :min(
                    question_count,
                    len(questions),
                )
            ]

            # ------------------------------------------
            # Create Practice Session
            # ------------------------------------------

            session = PracticeSession(
                user_id=user_id,
                
                question_bank_id=bank.id,

                question_count=len(selected),

                started_at=datetime.now(UTC),

                status="in_progress",
            )

            db.add(
                session
            )

            db.flush()

            # ------------------------------------------
            # Create Practice Answers
            # ------------------------------------------

            for position, question in enumerate(
                selected
            ):

                practice_answer = (
                    PracticeAnswer(
                        practice_session_id=
                            session.id,

                        question_id=
                            question.id,

                        selected_option=
                            None,

                        is_correct=
                            None,

                        position=
                            position,
                    )
                )

                db.add(
                    practice_answer
                )

            db.commit()

            return {
                "success": True,

                "practiceId":
                    session.id,

                "questionCount":
                    len(selected),

                "questionBank":
                    bank.file_name,
            }

        except Exception:

            db.rollback()

            raise

        finally:

            db.close()

    # ==================================================
    # Get Practice
    # ==================================================

    def get_practice(
        self,
        practice_id: str,
        user_id
    ):

        db = SessionLocal()

        try:

            session = (
                self._get_session(
                    db,
                    practice_id,
                    user_id,
                )
            )

            if session is None:
                raise HTTPException(
                    status_code=404,
                    detail="Practice session not found.",
                )

            return (
                self._serialize_session(
                    db,
                    session,
                )
            )

        finally:

            db.close()

    # ==================================================
    # Submit Answer
    # ==================================================

    def submit_answer(
    self,
    practice_id: str,
    user_id: str,
    question_id: str,
    selected_option: str,
    ):

        db = SessionLocal()

        try:

            session = db.scalar(
                select(PracticeSession)
                .where(
                    PracticeSession.id == practice_id,
                    PracticeSession.user_id == user_id,
                )
            )

            if session is None:
                raise HTTPException(
                    status_code=404,
                    detail="Practice session not found.",
                )

            if session.status == "completed":

                raise ValueError(
                    "Practice session "
                    "is already completed."
                )

            answer = db.scalar(
                select(
                    PracticeAnswer
                )
                .where(
                    PracticeAnswer
                    .practice_session_id
                    == practice_id,

                    PracticeAnswer
                    .question_id
                    == question_id,
                )
            )

            if answer is None:

                raise ValueError(
                    "Invalid question."
                )

            question = db.get(
                Question,
                question_id,
            )

            if question is None:

                raise ValueError(
                    "Question not found."
                )

            is_correct = (
                selected_option
                == question.correct_answer
            )

            answer.selected_option = (
                selected_option
            )

            answer.is_correct = (
                is_correct
            )

            db.commit()

            return {
                "correct":
                    is_correct,

                "correctAnswer":
                    question.correct_answer,

                "explanation":
                    question.explanation
                    or "",
            }

        except Exception:

            db.rollback()

            raise

        finally:

            db.close()

    # ==================================================
    # Finish Practice
    # ==================================================

    def finish_practice(
        self,
        practice_id: str,
        user_id
    ):

        db = SessionLocal()

        try:

            session = (
                self._get_session(
                    db,
                    practice_id,
                    user_id,
                )
            )

            if session is None:
                raise HTTPException(
                    status_code=404,
                    detail="Practice session not found.",
                )

            correct = 0
            wrong = 0
            skipped = 0

            for answer in (
                session.answers
            ):

                if (
                    answer.selected_option
                    is None
                ):

                    skipped += 1

                elif (
                    answer.is_correct
                    is True
                ):

                    correct += 1

                else:

                    wrong += 1

            total = len(
                session.answers
            )

            accuracy = (
                round(
                    correct
                    / total
                    * 100,
                    2,
                )
                if total
                else 0
            )

            session.status = (
                "completed"
            )

            session.completed_at = (
                datetime.now(UTC)
            )

            db.commit()

            return {
                "correct":
                    correct,

                "wrong":
                    wrong,

                "skipped":
                    skipped,

                "accuracy":
                    accuracy,
            }

        except Exception:

            db.rollback()

            raise

        finally:

            db.close()

    def get_current_practice(
    self,
    user_id: str,
):

        db = SessionLocal()

        try:

            session = db.scalar(
                select(PracticeSession)
                .where(
                    PracticeSession.user_id == user_id,
                    PracticeSession.status == "in_progress",
                )
                .order_by(
                    PracticeSession.started_at.desc()
                )
            )

            if session is None:

                return {
                    "exists": False,
                }

            serialized = self._serialize_session(
                db,
                session,
            )

            answered = sum(
                1
                for answer in session.answers
                if answer.selected_option is not None
            )

            return {
                "exists": True,
                "practice": {
                    **serialized,
                    "answered": answered,
                },
            }

        finally:

            db.close()