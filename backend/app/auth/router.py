import uuid
import re
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta

from app.database.session import get_db
from app.config import settings
from app.models.user import User
from app.logging.logger import log_application_event, record_operational_event

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class SignupRequest(BaseModel):
    mobile: str
    name: Optional[str] = "Customer"

class LoginRequest(BaseModel):
    mobile: str

def clean_phone_number(raw_phone: str) -> str:
    """Extract clean 10-digit mobile number."""
    digits = re.sub(r'\D', '', raw_phone)
    if len(digits) > 10:
        return digits[-10:]
    return digits if digits else raw_phone.strip()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    clean_mobile = clean_phone_number(req.mobile)
    existing = db.query(User).filter(User.mobile == clean_mobile).first()
    
    if existing:
        log_application_event(
            db, service_name="auth-service", level="INFO",
            message=f"Mobile {clean_mobile} already exists. Returning user account.",
            request_id=request_id, user_id=existing.user_id
        )
        token = create_access_token({"sub": existing.user_id, "mobile": existing.mobile})
        return {
            "success": True,
            "request_id": request_id,
            "token": token,
            "user": {
                "user_id": existing.user_id,
                "name": existing.name,
                "mobile": existing.mobile,
                "email": existing.email or f"user_{clean_mobile}@ddtechhub.com"
            }
        }

    user_id = f"USR-{uuid.uuid4().hex[:4].upper()}"
    user_name = req.name if req.name and req.name.strip() else f"User ({clean_mobile[-4:]})"
    new_user = User(
        user_id=user_id,
        name=user_name,
        mobile=clean_mobile,
        email=f"user_{clean_mobile}@ddtechhub.com",
        password_hash="TELEGRAM_OTP_AUTH"
    )
    db.add(new_user)
    db.commit()

    log_application_event(
        db, service_name="auth-service", level="INFO",
        message=f"User registered via Mobile: {clean_mobile}",
        request_id=request_id, user_id=user_id
    )
    record_operational_event(
        db, service_name="auth-service", event_type="LOGIN_REQUEST",
        status="SUCCESS", severity="LOW", request_id=request_id, user_id=user_id
    )

    token = create_access_token({"sub": user_id, "mobile": clean_mobile})
    return {
        "success": True,
        "request_id": request_id,
        "token": token,
        "user": {
            "user_id": user_id,
            "name": user_name,
            "mobile": clean_mobile,
            "email": f"user_{clean_mobile}@ddtechhub.com"
        }
    }

@router.post("/login")
def login(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    raw_mobile = str(payload.get("mobile", "")).strip()
    clean_mobile = clean_phone_number(raw_mobile)
    
    if not clean_mobile:
        raise HTTPException(status_code=400, detail="Mobile number is required.")

    user = db.query(User).filter((User.mobile == clean_mobile) | (User.mobile == raw_mobile)).first()
    
    if not user:
        user_id = f"USR-{uuid.uuid4().hex[:4].upper()}"
        user_name = f"User ({clean_mobile[-4:] if len(clean_mobile)>=4 else 'DEMO'})"
        user = User(
            user_id=user_id,
            name=user_name,
            mobile=clean_mobile,
            email=f"user_{clean_mobile}@ddtechhub.com",
            password_hash="TELEGRAM_OTP_AUTH"
        )
        db.add(user)
        db.commit()

    token = create_access_token({"sub": user.user_id, "mobile": user.mobile})
    log_application_event(
        db, service_name="auth-service", level="INFO",
        message=f"User login initiated via Mobile: {user.mobile}",
        request_id=request_id, user_id=user.user_id
    )
    record_operational_event(
        db, service_name="auth-service", event_type="LOGIN_REQUEST",
        status="SUCCESS", severity="LOW", request_id=request_id, user_id=user.user_id
    )
    
    return {
        "success": True,
        "request_id": request_id,
        "token": token,
        "user": {
            "user_id": user.user_id,
            "name": user.name or "Customer",
            "mobile": user.mobile,
            "email": user.email or f"user_{clean_mobile}@ddtechhub.com"
        }
    }
