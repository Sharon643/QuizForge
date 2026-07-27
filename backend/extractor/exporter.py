import json
import os
import re

from extractor.validator import Validator


class Exporter:

    @staticmethod
    def save_chunk(
        questions,
        chunk_file,
        output_dir,
    ):

        os.makedirs(output_dir, exist_ok=True)

        filename = (
            os.path.basename(chunk_file)
            .replace(".pdf", ".json")
        )

        with open(
            os.path.join(output_dir, filename),
            "w",
            encoding="utf-8",
        ) as f:

            json.dump(
                questions,
                f,
                indent=4,
                ensure_ascii=False,
            )

    @staticmethod
    def merge(
        chunk_dir,
        output_file,
    ):

        all_questions = []

        chunk_files = sorted(
            [
                file
                for file in os.listdir(chunk_dir)
                if file.endswith(".json")
            ],
            key=lambda file: int(
                re.search(
                    r"chunk_(\d+)_",
                    file,
                ).group(1)
            ),
        )

        for file in chunk_files:

            with open(
                os.path.join(chunk_dir, file),
                encoding="utf-8",
            ) as f:

                all_questions.extend(
                    json.load(f)
                )

        (
            valid_questions,
            errors,
        ) = Validator.validate(
            all_questions
        )

        Exporter._save_invalid(
            all_questions,
            valid_questions,
            errors,
            output_file,
        )

        Exporter._save_output(
            valid_questions,
            output_file,
        )

        Exporter._print_summary(
            len(all_questions),
            len(valid_questions),
            len(errors),
            output_file,
        )

    @staticmethod
    def _save_output(
        questions,
        output_file,
    ):

        os.makedirs(
            os.path.dirname(output_file),
            exist_ok=True,
        )

        with open(
            output_file,
            "w",
            encoding="utf-8",
        ) as f:

            json.dump(
                questions,
                f,
                indent=4,
                ensure_ascii=False,
            )

    @staticmethod
    def _save_invalid(
        all_questions,
        valid_questions,
        errors,
        output_file,
    ):

        output_dir = os.path.dirname(output_file)

        os.makedirs(
            output_dir,
            exist_ok=True,
        )

        # Collect IDs only from valid questions
        # that actually have an ID.
        valid_ids = {
            question.get("id")
            for question in valid_questions
            if question.get("id") is not None
        }

        invalid_questions = []

        for question in all_questions:

            question_id = question.get("id")

            # Missing ID means the question did not
            # satisfy the expected schema, so preserve
            # it in invalid_questions.json instead of
            # crashing the entire merge.
            if question_id is None:
                invalid_questions.append(question)
                continue

            if question_id not in valid_ids:
                invalid_questions.append(question)

        with open(
            os.path.join(
                output_dir,
                "invalid_questions.json",
            ),
            "w",
            encoding="utf-8",
        ) as f:

            json.dump(
                invalid_questions,
                f,
                indent=4,
                ensure_ascii=False,
            )

        with open(
            os.path.join(
                output_dir,
                "validation_report.txt",
            ),
            "w",
            encoding="utf-8",
        ) as f:

            if not errors:

                f.write(
                    "No validation errors."
                )

            else:

                for error in errors:

                    f.write(
                        str(error) + "\n"
                    )

    @staticmethod
    def _print_summary(
        total_questions,
        valid_questions,
        error_count,
        output_file,
    ):

        invalid_questions = (
            total_questions - valid_questions
        )

        validation_rate = (
            valid_questions / total_questions * 100
            if total_questions
            else 0
        )

        # print("\n" + "=" * 60)
        # print("PDF EXTRACTION SUMMARY")
        # print("=" * 60)

        # print(
        #     f"Total Questions   : {total_questions}"
        # )

        # print(
        #     f"Valid Questions   : {valid_questions}"
        # )

        # print(
        #     f"Invalid Questions : {invalid_questions}"
        # )

        # print(
        #     f"Validation Errors : {error_count}"
        # )

        # print(
        #     f"Validation Rate   : {validation_rate:.2f}%"
        # )

        # print()

        # print(
        #     f"Questions JSON    : {output_file}"
        # )

        # print(
        #     "Invalid Questions : "
        #     + os.path.join(
        #         os.path.dirname(output_file),
        #         "invalid_questions.json",
        #     )
        # )

        # print(
        #     "Validation Report : "
        #     + os.path.join(
        #         os.path.dirname(output_file),
        #         "validation_report.txt",
        #     )
        # )

        # print("=" * 60)