import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.logging.logger import log_application_event, record_operational_event

router = APIRouter(prefix="/api/otp", tags=["OTP"])

VALID_OTPS = {}

class OtpSendRequest(BaseModel):
    user_id: str
    mobile: str

class OtpVerifyRequest(BaseModel):
    user_id: str
    otp: str

@router.post("/send")
def send_otp(req: OtpSendRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    demo_otp = "1234"
    VALID_OTPS[req.user_id] = demo_otp

    # Log application event - Never include actual OTP
    log_application_event(
        db, service_name="otp-service", level="INFO",
        message=f"OTP dispatched via Telegram Bot to mobile ending in {req.mobile[-4:] if len(req.mobile)>=4 else 'XXXX'}",
        request_id=request_id, user_id=req.user_id
    )

    # Record operational event with telegram-bot-provider dependency
    op_event = record_operational_event(
        db, service_name="otp-service", event_type="OTP_SEND",
        status="SUCCESS", severity="LOW", request_id=request_id,
        user_id=req.user_id, response_time_ms=160,
        dependency="telegram-bot-provider",
        metadata={"provider": "telegram-bot-provider", "channel": "Telegram Bot", "mobile": req.mobile}
    )

    return {
        "success": True,
        "message": f"OTP sent via Telegram Bot to {req.mobile}",
        "request_id": request_id,
        "event_id": op_event.event_id,
        "channel": "Telegram Bot",
        "demo_hint": "Use OTP 1234 for testing"
    }

@router.post("/verify")
def verify_otp(req: OtpVerifyRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    stored_otp = VALID_OTPS.get(req.user_id, "1234")

    if req.otp == stored_otp or req.otp == "1234":
        log_application_event(
            db, service_name="otp-service", level="INFO",
            message=f"Telegram OTP verified successfully for user {req.user_id}",
            request_id=request_id, user_id=req.user_id
        )
        record_operational_event(
            db, service_name="otp-service", event_type="OTP_VERIFY",
            status="SUCCESS", severity="LOW", request_id=request_id,
            user_id=req.user_id, response_time_ms=110,
            dependency="telegram-bot-provider"
        )
        return {
            "success": True,
            "message": "Telegram OTP verified successfully.",
            "request_id": request_id
        }
    else:
        log_application_event(
            db, service_name="otp-service", level="WARNING",
            message=f"OTP verification failed for user {req.user_id}: Invalid OTP entered",
            request_id=request_id, user_id=req.user_id, error_code="OTP_MISMATCH"
        )
        record_operational_event(
            db, service_name="otp-service", event_type="OTP_FAILURE",
            status="FAILED", severity="MEDIUM", request_id=request_id,
            user_id=req.user_id, response_time_ms=105,
            error_code="OTP_MISMATCH", error_message="Invalid Telegram OTP entered by user",
            dependency="telegram-bot-provider"
        )
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter 1234.")

@router.post("/resend")
def resend_otp(req: OtpSendRequest, db: Session = Depends(get_db)):
    return send_otp(req, db)
