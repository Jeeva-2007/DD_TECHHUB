import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.payment import Payment
from app.logging.logger import log_application_event, record_operational_event

router = APIRouter(prefix="/api/payment", tags=["Payment"])

class PaymentProcessRequest(BaseModel):
    order_id: str
    user_id: str
    amount: float
    payment_method: str = "CARD" # CARD, UPI, NETBANKING, COD
    simulate_failure: bool = False
    failure_type: Optional[str] = "PAYMENT_DB_TIMEOUT" # e.g. PAYMENT_GATEWAY_TIMEOUT, PAYMENT_SERVICE_UNAVAILABLE, PAYMENT_DATABASE_ERROR, PAYMENT_DB_TIMEOUT, PAYMENT_RATE_LIMIT

FAILURE_CONFIGS = {
    "PAYMENT_GATEWAY_TIMEOUT": {
        "error_message": "Payment gateway connection timed out after 5000ms",
        "severity": "HIGH",
        "dependency": "demo-payment-gateway",
        "response_time_ms": 5050
    },
    "PAYMENT_SERVICE_UNAVAILABLE": {
        "error_message": "Payment processing service is currently down or unreachable",
        "severity": "CRITICAL",
        "dependency": "payment-service",
        "response_time_ms": 450
    },
    "PAYMENT_DATABASE_ERROR": {
        "error_message": "Database transaction deadlocked or connection failed",
        "severity": "HIGH",
        "dependency": "database",
        "response_time_ms": 1200
    },
    "PAYMENT_DB_TIMEOUT": {
        "error_message": "Database request timed out during payment write lock",
        "severity": "HIGH",
        "dependency": "database",
        "response_time_ms": 3100
    },
    "PAYMENT_RATE_LIMIT": {
        "error_message": "Payment rate limit exceeded for user account",
        "severity": "MEDIUM",
        "dependency": "payment-service",
        "response_time_ms": 80
    }
}

@router.post("/process")
def process_payment(req: PaymentProcessRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    payment_id = f"PAY-{uuid.uuid4().hex[:6].upper()}"

    if req.simulate_failure:
        failure_code = req.failure_type if req.failure_type in FAILURE_CONFIGS else "PAYMENT_DB_TIMEOUT"
        cfg = FAILURE_CONFIGS[failure_code]

        # 1. Store failed payment record
        pay_rec = Payment(
            payment_id=payment_id,
            order_id=req.order_id,
            user_id=req.user_id,
            amount=req.amount,
            status="FAILED",
            payment_method=req.payment_method,
            error_code=failure_code
        )
        db.add(pay_rec)
        db.commit()

        # 2. Store application log (ERROR level)
        log_application_event(
            db,
            service_name="payment-service",
            level="ERROR",
            message=f"Payment execution failed for order {req.order_id}: {cfg['error_message']}",
            request_id=request_id,
            user_id=req.user_id,
            error_code=failure_code,
            metadata={"payment_id": payment_id, "amount": req.amount}
        )

        # 3. Store operational event (FAILED, HIGH/CRITICAL)
        op_event = record_operational_event(
            db,
            service_name="payment-service",
            event_type="PAYMENT_FAILURE",
            status="FAILED",
            severity=cfg["severity"],
            request_id=request_id,
            user_id=req.user_id,
            response_time_ms=cfg["response_time_ms"],
            error_code=failure_code,
            error_message=cfg["error_message"],
            dependency=cfg["dependency"],
            metadata={
                "payment_id": payment_id,
                "order_id": req.order_id,
                "amount": req.amount,
                "payment_method": req.payment_method
            }
        )

        return {
            "success": False,
            "payment_id": payment_id,
            "order_id": req.order_id,
            "status": "FAILED",
            "request_id": request_id,
            "event_id": op_event.event_id,
            "error_code": failure_code,
            "error_message": cfg["error_message"]
        }

    # Successful payment simulation
    pay_rec = Payment(
        payment_id=payment_id,
        order_id=req.order_id,
        user_id=req.user_id,
        amount=req.amount,
        status="SUCCESS",
        payment_method=req.payment_method
    )
    db.add(pay_rec)
    db.commit()

    log_application_event(
        db,
        service_name="payment-service",
        level="INFO",
        message=f"Payment {payment_id} processed successfully for order {req.order_id}",
        request_id=request_id,
        user_id=req.user_id
    )

    record_operational_event(
        db,
        service_name="payment-service",
        event_type="PAYMENT_SUCCESS",
        status="SUCCESS",
        severity="LOW",
        request_id=request_id,
        user_id=req.user_id,
        response_time_ms=320,
        dependency="demo-payment-gateway",
        metadata={"payment_id": payment_id, "order_id": req.order_id, "amount": req.amount}
    )

    return {
        "success": True,
        "payment_id": payment_id,
        "order_id": req.order_id,
        "status": "SUCCESS",
        "request_id": request_id
    }
