from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from core.config import settings

email_header = APIKeyHeader(name="X-Admin-Email", auto_error=False)
password_header = APIKeyHeader(name="X-Admin-Password", auto_error=False)

import hmac

async def verify_admin(
    email: str = Security(email_header),
    password: str = Security(password_header)
):
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin credentials missing",
        )
    
    # Use hmac.compare_digest to prevent timing attacks
    if email != settings.ADMIN_EMAIL or not hmac.compare_digest(password, settings.ADMIN_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin credentials",
        )
    return email
