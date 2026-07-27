from pathlib import Path
import json

from database.database import SessionLocal
from database.models import Question

from extractor.extractor import Extractor

from utils.progress import ProgressManager
from utils.question_bank import QuestionBankManager


class ExtractionService:

    def __init__(self):
        self.extractor = Extractor()

    def extract(
        self,
        pdf_path: Path,
        job_id: str,
        user_id: str,
        original_file_name: str,
    ) -> dict:

        progress = ProgressManager(
            job_id
        )

        progress.update(
            stage="starting",
            percent=0,
            message="Preparing extraction...",
        )

        # --------------------------------------------------
        # Extract Questions
        # --------------------------------------------------

        output_json = self.extractor.run(
            str(pdf_path),
            progress=progress,
        )

        with open(
            output_json,
            "r",
            encoding="utf-8",
        ) as f:

            questions = json.load(f)

        question_count = len(
            questions
        )

        subjects = len(
            {
                question.get(
                    "subject",
                    "Unknown",
                )
                for question in questions
            }
        )

        official_answers = sum(
            1
            for question in questions
            if question.get(
                "correct_answer"
            )
        )

        missing_answers = (
            question_count
            - official_answers
        )

        # --------------------------------------------------
        # Database
        # --------------------------------------------------

        db = SessionLocal()

        manager = QuestionBankManager(
            db
        )

        try:

            # ----------------------------------------------
            # Create Question Bank
            # ----------------------------------------------

            bank = manager.create_bank(
                file_name=original_file_name,
                question_count=question_count,
                user_id=user_id,
            )

            # ----------------------------------------------
            # Save Questions
            # ----------------------------------------------

            for question in questions:

                options = (
                    question.get("options")
                    or {}
                )

                # Support both:
                #
                # options = {
                #   "A": "...",
                #   "B": "..."
                # }
                #
                # and direct fields such as
                # option_a, option_b, etc.

                option_a = (
                    options.get("A")
                    or options.get("a")
                    or question.get("option_a")
                )

                option_b = (
                    options.get("B")
                    or options.get("b")
                    or question.get("option_b")
                )

                option_c = (
                    options.get("C")
                    or options.get("c")
                    or question.get("option_c")
                )

                option_d = (
                    options.get("D")
                    or options.get("d")
                    or question.get("option_d")
                )

                db_question = Question(
                    question_bank_id=bank["id"],
                    number=question.get("number"),

                    question_text=(
                        question.get(
                            "question"
                        )
                        or question.get(
                            "question_text"
                        )
                        or ""
                    ),

                    option_a=option_a,
                    option_b=option_b,
                    option_c=option_c,
                    option_d=option_d,

                    correct_answer=(
                        question.get(
                            "correct_answer"
                        )
                    ),

                    explanation=(
                        question.get(
                            "explanation"
                        )
                    ),

                    subject=(
                        question.get(
                            "subject"
                        )
                    ),

                    page=(
                        question.get(
                            "page"
                        )
                    ),

                    answer_source=(
                        question.get(
                            "answer_source"
                        )
                    ),

                    answer_confidence=(
                        question.get(
                            "confidence"
                        )
                    ),
                )

                db.add(
                    db_question
                )

            db.commit()

            # ----------------------------------------------
            # Temporary JSON Compatibility
            # ----------------------------------------------
            #
            # Some existing services still read:
            #
            # data/extracted/{bank_id}.json
            #
            # Keep this until those services are migrated
            # to PostgreSQL.

            # ----------------------------------------------
            # Complete
            # ----------------------------------------------
            progress.update(
                stage="completed",
                percent=100,
                message="Extraction completed!",
                completed=True,

                bankId=bank["id"],
                fileName=bank["fileName"],

                questionCount=question_count,
                subjects=subjects,

                officialAnswers=official_answers,
                missingAnswers=missing_answers,
            )

            return {
                "success": True,

                "jobId": job_id,

                "bankId": bank["id"],
                "fileName": bank["fileName"],

                "questionCount": question_count,
                "subjects": subjects,

                "officialAnswers": official_answers,
                "missingAnswers": missing_answers,
            }

        except Exception:

            db.rollback()

            progress.update(
                stage="failed",
                message="Failed to save extracted questions.",
                completed=True,
            )

            raise

        finally:

            db.close()