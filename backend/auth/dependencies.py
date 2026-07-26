import os

import jwt

from dotenv import load_dotenv

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jwt import PyJWKClient

from sqlalchemy import select

from database.database import SessionLocal
from database.models import User


load_dotenv()


# ============================================================
# Configuration
# ============================================================

SUPABASE_URL = os.getenv(
    "SUPABASE_URL"
)

if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is not configured."
    )


SUPABASE_URL = (
    SUPABASE_URL.rstrip("/")
)

JWKS_URL = (
    f"{SUPABASE_URL}"
    "/auth/v1/.well-known/jwks.json"
)

JWT_ISSUER = (
    f"{SUPABASE_URL}"
    "/auth/v1"
)


# ============================================================
# Security
# ============================================================

security = HTTPBearer(
    auto_error=False
)

jwks_client = PyJWKClient(
    JWKS_URL
)


# ============================================================
# Current Authenticated User
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):

    # --------------------------------------------------------
    # Authorization header missing
    # --------------------------------------------------------

    if credentials is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    token = credentials.credentials

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # Find signing key from Supabase JWKS
        # ----------------------------------------------------

        signing_key = jwks_client.get_signing_key_from_jwt(
            token
        )

        # ----------------------------------------------------
        # Verify JWT
        # ----------------------------------------------------

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[
                "ES256",
                "RS256",
            ],
            issuer=JWT_ISSUER,
            audience="authenticated",
            leeway=30,   # allow 30 seconds of clock skew
            options={
                "require": [
                    "exp",
                    "sub",
                ]
            },
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token.",
            )

        # ----------------------------------------------------
        # Ensure user exists in our database
        # ----------------------------------------------------

        user = db.scalar(
            select(User).where(
                User.id == user_id
            )
        )

        if user is None:

            user = User(
                id=user_id,
                email=email,
            )

            db.add(user)
            db.commit()

        return {
            "id": user_id,
            "email": email,
            "role": payload.get("role"),
            "metadata": payload.get(
                "user_metadata",
                {},
            ),
        }

    except HTTPException:

        raise

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    except Exception as error:

        db.rollback()

        print(
            "JWT verification failed:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    finally:

        db.close()