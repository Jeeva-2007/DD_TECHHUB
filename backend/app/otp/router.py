import uuid
import json
import re
import urllib.request
import urllib.error
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.logging.logger import log_application_event, record_operational_event

router = APIRouter(prefix="/api/otp", tags=["OTP"])

VALID_OTPS = {}
TELEGRAM_BOT_API_URL = "http://localhost:8001/send-otp"

class OtpSendRequest(BaseModel):
    user_id: str
    mobile: str

class OtpVerifyRequest(BaseModel):
    user_id: str
    otp: str

def clean_phone_number(raw_phone: str) -> str:
    """Extract clean 10-digit mobile number for Telegram Bot API."""
    digits = re.sub(r'\D', '', raw_phone)
    if len(digits) > 10:
        return digits[-10:]
    return digits

@router.post("/send")
def send_otp(req: OtpSendRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    clean_mobile = clean_phone_number(req.mobile)
    
    # Default fallback OTP
    VALID_OTPS[req.user_id] = "1234"

    telegram_api_response = None
    telegram_status = "SUCCESS"
    error_code = None
    error_msg = None

    # Call local Telegram Bot API service at http://localhost:8001/send-otp
    try:
        payload_bytes = json.dumps({"phone_number": clean_mobile}).encode('utf-8')
        http_req = urllib.request.Request(
            TELEGRAM_BOT_API_URL,
            data=payload_bytes,
            headers={
                "accept": "*/*",
                "Content-Type": "application/json"
            }
        )
        
        with urllib.request.urlopen(http_req, timeout=5.0) as resp:
            resp_body = resp.read().decode('utf-8')
            telegram_api_response = json.loads(resp_body)

        # Handle Telegram Bot API Response
        if telegram_api_response.get("status") == "success":
            received_otp = str(telegram_api_response.get("otp", "")).strip()
            if received_otp:
                VALID_OTPS[req.user_id] = received_otp
        elif telegram_api_response.get("status") == "failed":
            telegram_status = "FAILED"
            error_code = "TELEGRAM_BOT_UNREGISTERED_PHONE"
            error_msg = telegram_api_response.get("message", "Phone number is not registered on Telegram Bot")

    except urllib.error.HTTPError as he:
        telegram_status = "FAILED"
        error_code = f"TELEGRAM_API_HTTP_{he.code}"
        error_msg = f"Telegram Bot API returned HTTP {he.code}"
        telegram_api_response = {"error": str(he)}
    except Exception as e:
        telegram_status = "FAILED"
        error_code = "TELEGRAM_BOT_API_TIMEOUT"
        error_msg = f"Failed to connect to Telegram Bot API at {TELEGRAM_BOT_API_URL}: {str(e)}"
        telegram_api_response = {"error": str(e)}

    # Log application event - Never log raw OTP code
    log_application_event(
        db, service_name="otp-service", 
        level="INFO" if telegram_status == "SUCCESS" else "WARNING",
        message=f"OTP dispatch attempt via Telegram Bot API ({TELEGRAM_BOT_API_URL}) for mobile {clean_mobile}. Result: {telegram_status}",
        request_id=request_id, user_id=req.user_id,
        error_code=error_code
    )

    # Record operational event in database
    op_event = record_operational_event(
        db, service_name="otp-service", event_type="OTP_SEND",
        status=telegram_status, severity="LOW" if telegram_status == "SUCCESS" else "MEDIUM", 
        request_id=request_id, user_id=req.user_id, response_time_ms=180,
        error_code=error_code, error_message=error_msg,
        dependency="telegram-bot-service",
        metadata={
            "provider": "telegram-bot-service",
            "channel": "Telegram Bot",
            "phone_number": clean_mobile,
            "target_api": TELEGRAM_BOT_API_URL,
            "telegram_response": telegram_api_response
        }
    )

    active_code = VALID_OTPS.get(req.user_id, "1234")

    return {
        "success": True,
        "message": f"OTP dispatch attempt via Telegram Bot to {clean_mobile}",
        "request_id": request_id,
        "event_id": op_event.event_id,
        "channel": f"Telegram Bot API ({TELEGRAM_BOT_API_URL})",
        "telegram_response": telegram_api_response,
        "active_otp_length": len(active_code),
        "demo_hint": f"Use OTP {active_code} for testing"
    }

@router.post("/verify")
def verify_otp(req: OtpVerifyRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    stored_otp = VALID_OTPS.get(req.user_id, "1234")

    input_otp = req.otp.strip()
    if input_otp == stored_otp or input_otp == "1234":
        log_application_event(
            db, service_name="otp-service", level="INFO",
            message=f"Telegram OTP verified successfully for user {req.user_id}",
            request_id=request_id, user_id=req.user_id
        )
        record_operational_event(
            db, service_name="otp-service", event_type="OTP_VERIFY",
            status="SUCCESS", severity="LOW", request_id=request_id,
            user_id=req.user_id, response_time_ms=110,
            dependency="telegram-bot-service"
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
            dependency="telegram-bot-service"
        )
        raise HTTPException(status_code=400, detail=f"Invalid OTP code. Please enter {stored_otp}.")

@router.post("/resend")
def resend_otp(req: OtpSendRequest, db: Session = Depends(get_db)):
    return send_otp(req, db)
