from pathlib import Path
import os

# ==========================================================
# Upload
# ==========================================================

UPLOAD_FOLDER = Path(
    os.getenv(
        "UPLOAD_FOLDER",
        "data/pdf",
    )
)

UPLOAD_FOLDER.mkdir(
    parents=True,
    exist_ok=True,
)

MAX_UPLOAD_SIZE = int(
    os.getenv(
        "MAX_UPLOAD_SIZE",
        25 * 1024 * 1024,
    )
)

PDF_SIGNATURE = b"%PDF-"