from statistics import mean

from extractor.gemini_client import GeminiClient


class AnswerGenerator:

    BATCH_SIZE = 25

    def __init__(self):

        self.client = GeminiClient()

    def _chunks(
        self,
        items,
    ):

        for i in range(
            0,
            len(items),
            self.BATCH_SIZE,
        ):

            yield items[
                i:i + self.BATCH_SIZE
            ]

    def generate(
        self,
        questions,
    ):

        unanswered = [
            question
            for question in questions
            if not question.get(
                "correct_answer"
            )
        ]

        if not unanswered:

            return {
                "updated": 0,
                "remaining": 0,
                "average_confidence": 0,
            }

        results = []

        for batch in self._chunks(
            unanswered
        ):

            generated = (
                self.client.generate_answers(
                    batch
                )
            )

            if generated:

                results.extend(
                    generated
                )

        # Only accept generated results
        # that contain an ID.

        answer_map = {
            item["id"]: item
            for item in results
            if item.get("id")
        }

        updated = 0

        confidences = []

        for question in questions:

            question_id = (
                question.get("id")
            )

            if not question_id:
                continue

            result = (
                answer_map.get(
                    question_id
                )
            )

            if result is None:
                continue

            correct_answer = (
                result.get(
                    "correct_answer"
                )
            )

            confidence = (
                result.get(
                    "confidence"
                )
            )

            explanation = (
                result.get(
                    "explanation"
                )
            )

            question[
                "correct_answer"
            ] = correct_answer

            question[
                "confidence"
            ] = confidence

            question[
                "explanation"
            ] = explanation or ""

            question[
                "answer_source"
            ] = (
                "ai"
                if correct_answer
                else "none"
            )

            if confidence is not None:

                confidences.append(
                    confidence
                )

            if correct_answer:

                updated += 1

        remaining = sum(
            1
            for question in questions
            if not question.get(
                "correct_answer"
            )
        )

        return {

            "processed": updated + remaining,
            
            "updated": updated,

            "remaining": remaining,

            "average_confidence": (
                round(
                    mean(confidences),
                    2,
                )
                if confidences
                else 0
            ),
        }