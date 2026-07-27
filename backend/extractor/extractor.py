import os

from extractor.pdf_splitter import PDFSplitter
from extractor.gemini_client import GeminiClient
from extractor.exporter import Exporter
from extractor.checkpoint import Checkpoint

from extractor.config import (
    CHUNK_SIZE,
    CHUNKS_DIR,
    CHUNK_JSON_DIR,
    OUTPUT_DIR,
)


class Extractor:

    def __init__(self):
        self.splitter = PDFSplitter(CHUNK_SIZE)
        self.client = GeminiClient()

    def _get_paths(self, pdf_path):
        """
        Create PDF-specific folders.
        """

        pdf_name = os.path.splitext(
            os.path.basename(pdf_path)
        )[0]

        chunk_dir = os.path.join(
            CHUNKS_DIR,
            pdf_name,
        )

        chunk_json_dir = os.path.join(
            CHUNK_JSON_DIR,
            pdf_name,
        )

        output_json = os.path.join(
            OUTPUT_DIR,
            f"{pdf_name}.json",
        )

        return chunk_dir, chunk_json_dir, output_json

    def split_pdf(self, pdf_path, chunk_dir):

        os.makedirs(chunk_dir, exist_ok=True)

        existing = sorted(
            f for f in os.listdir(chunk_dir)
            if f.endswith(".pdf")
        )

        if existing:

            # print("Using existing PDF chunks.")

            return [
                os.path.join(chunk_dir, f)
                for f in existing
            ]

        # print("\n========== SPLITTING PDF ==========\n")

        return self.splitter.split(
            pdf_path,
            chunk_dir,
        )

    def process_chunks(
        self,
        chunks,
        chunk_json_dir,
        progress=None,
    ):

        # print("\n========== EXTRACTING ==========\n")

        os.makedirs(
            chunk_json_dir,
            exist_ok=True,
        )

        total = len(chunks)

        for index, chunk in enumerate(
            chunks,
            start=1,
        ):

            percent = 15 + int(
                (index / total) * 70
            )

            if progress:
                progress.update(
                    stage="extracting",
                    percent=percent,
                    message=f"Extracting chunk {index}/{total}",
                )

            # print(
            #     f"\n========== Chunk {index}/{total} =========="
            # )

            if Checkpoint.completed(
                chunk,
                chunk_json_dir,
            ):

                print(
                    f"Skipping {os.path.basename(chunk)}"
                )

                continue

            print(
                f"Processing {os.path.basename(chunk)}"
            )

            questions = self.client.extract(pdf_path=chunk,chunk_number=index,total_chunks=total,)

            Exporter.save_chunk(
                questions,
                chunk,
                chunk_json_dir,
            )

    def merge_results(
        self,
        chunk_json_dir,
        output_json,
    ):

        # print("\n========== MERGING ==========\n")

        os.makedirs(
            os.path.dirname(output_json),
            exist_ok=True,
        )

        Exporter.merge(
            chunk_json_dir,
            output_json,
        )

    def run(
        self,
        pdf_path,
        progress=None,
    ):

        chunk_dir, chunk_json_dir, output_json = self._get_paths(
            pdf_path
        )

        if progress:
            progress.update(
                stage="splitting",
                percent=5,
                message="Splitting PDF...",
            )

        chunks = self.split_pdf(
            pdf_path,
            chunk_dir,
        )

        if progress:
            progress.update(
                stage="extracting",
                percent=15,
                message=f"Created {len(chunks)} chunks",
            )

        self.process_chunks(
            chunks,
            chunk_json_dir,
            progress,
        )

        if progress:
            progress.update(
                stage="merging",
                percent=90,
                message="Merging questions...",
            )

        self.merge_results(
            chunk_json_dir,
            output_json,
        )

        return output_json