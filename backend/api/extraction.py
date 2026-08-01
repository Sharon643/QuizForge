from pathlib import Path
import shutil
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    Request,
)

from core.security.rate_limit import limiter

from auth.dependencies import (
    get_current_user,
)

from services.extraction_service import (
    ExtractionService,
)

from utils.progress import (
    ProgressManager,
)

from core.config import (
    UPLOAD_FOLDER,
    MAX_UPLOAD_SIZE,
    PDF_SIGNATURE,
)


router = APIRouter()

service = ExtractionService()

# ============================================================
# Start Extraction
# ============================================================

@router.post("/extract")
@limiter.limit("10/hour")
async def extract(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):

    # --------------------------------------------------------
    # Validate PDF
    # --------------------------------------------------------

# --------------------------------------------------------
# Validate Uploaded File
# --------------------------------------------------------

# Content-Type

    if (
        file.content_type is None
        or file.content_type.lower() != "application/pdf"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )


    # Original filename

    safe_filename = Path(
        file.filename or "upload.pdf"
    ).name

    if not safe_filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="File must have a .pdf extension.",
        )


    # File size

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    if file_size > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail="PDF exceeds the 25 MB upload limit.",
        )


    # PDF signature

    header = file.file.read(len(PDF_SIGNATURE))
    file.file.seek(0)

    if header != PDF_SIGNATURE:
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file.",
        )


    # --------------------------------------------------------
    # Generate Job ID
    # --------------------------------------------------------

    job_id = str(
        uuid.uuid4()
    )


    # --------------------------------------------------------
    # Create unique PDF path
    # --------------------------------------------------------
    #
    # Don't use only file.filename.
    #
    # Two users could upload:
    #
    # questions.pdf
    #
    # at the same time.
    # --------------------------------------------------------

    pdf_path = (
        UPLOAD_FOLDER
        / f"{job_id}_{safe_filename}"
    )


    # --------------------------------------------------------
    # Save Uploaded PDF
    # --------------------------------------------------------

    with open(
        pdf_path,
        "wb",
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer,
        )


    # --------------------------------------------------------
    # Start Background Extraction
    # --------------------------------------------------------

    background_tasks.add_task(
        service.extract,
        pdf_path,
        job_id,
        current_user["id"],
        safe_filename,
    )


    return {
        "success": True,
        "jobId": job_id,
    }


# ============================================================
# Extraction Status
# ============================================================

@router.get(
    "/extract/status/{job_id}"
)
async def extraction_status(
    job_id: str,

    current_user=Depends(
        get_current_user
    ),
):

    progress = ProgressManager(
        job_id
    )

    data = progress.read()


    if data is None:

        raise HTTPException(
            status_code=404,
            detail="Job not found.",
        )


    return data