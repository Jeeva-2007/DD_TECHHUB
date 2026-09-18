import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.logging.logger import log_application_event, record_operational_event

router = APIRouter(prefix="/api/actions", tags=["Controlled Remediation Actions"])

class ActionRequest(BaseModel):
    request_id: str
    order_id: str = None
    user_id: str = None

@router.post("/payment/retry")
def retry_payment_action(req: ActionRequest, db: Session = Depends(get_db)):
    action_req_id = f"REQ-ACT-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="payment-service", level="INFO",
        message=f"Controlled Remediation Action: Payment retry triggered for request {req.request_id}",
        request_id=action_req_id, user_id=req.user_id
    )
    record_operational_event(
        db, service_name="payment-service", event_type="PAYMENT_PROCESS",
        status="SUCCESS", severity="LOW", request_id=action_req_id,
        user_id=req.user_id, response_time_ms=210,
        dependency="demo-payment-gateway",
        metadata={"action": "RETRY_PAYMENT", "target_request_id": req.request_id}
    )
    return {
        "success": True,
        "action": "PAYMENT_RETRY",
        "status": "EXECUTED",
        "action_request_id": action_req_id,
        "message": "Payment retry request successfully executed."
    }

@router.post("/payment/restart")
def restart_payment_service_action(req: ActionRequest, db: Session = Depends(get_db)):
    action_req_id = f"REQ-ACT-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="payment-service", level="WARNING",
        message=f"Controlled Remediation Action: Service restart initiated for payment-service",
        request_id=action_req_id
    )
    record_operational_event(
        db, service_name="payment-service", event_type="SERVICE_ERROR",
        status="SUCCESS", severity="MEDIUM", request_id=action_req_id,
        response_time_ms=1200, dependency="payment-service",
        metadata={"action": "RESTART_SERVICE"}
    )
    return {
        "success": True,
        "action": "PAYMENT_SERVICE_RESTART",
        "status": "EXECUTED",
        "action_request_id": action_req_id,
        "message": "Payment service connection pool reset and service restarted."
    }

@router.post("/otp/retry")
def retry_otp_action(req: ActionRequest, db: Session = Depends(get_db)):
    action_req_id = f"REQ-ACT-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="otp-service", level="INFO",
        message=f"Controlled Remediation Action: OTP retry triggered for request {req.request_id}",
        request_id=action_req_id, user_id=req.user_id
    )
    record_operational_event(
        db, service_name="otp-service", event_type="OTP_SEND",
        status="SUCCESS", severity="LOW", request_id=action_req_id,
        user_id=req.user_id, response_time_ms=190,
        dependency="demo-sms-provider",
        metadata={"action": "RETRY_OTP", "target_request_id": req.request_id}
    )
    return {
        "success": True,
        "action": "OTP_RETRY",
        "status": "EXECUTED",
        "action_request_id": action_req_id,
        "message": "OTP dispatch retry initiated successfully."
    }
