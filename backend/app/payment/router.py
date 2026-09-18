import uuid
import requests
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.payment import Payment
from app.models.user import User
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

import json
from pathlib import Path

def get_capacity_config() -> dict:
    config_path = Path(__file__).resolve().parent.parent.parent.parent / "capacity_config.json"
    if config_path.exists():
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"db_is_busy": False}

@router.post("/process")
def process_payment(req: PaymentProcessRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    payment_id = f"PAY-{uuid.uuid4().hex[:6].upper()}"

    cap_cfg = get_capacity_config()
    db_busy = cap_cfg.get("db_is_busy", False)

    if req.simulate_failure or db_busy:
        failure_code = "DB_CONNECTION_LIMIT_EXCEEDED" if db_busy else (req.failure_type if req.failure_type in FAILURE_CONFIGS else "PAYMENT_DB_TIMEOUT")
        cfg = {
            "error_message": "Database request timed out during payment write lock (100% connection pool capacity reached)",
            "severity": "HIGH",
            "dependency": "database",
            "response_time_ms": 3100
        } if db_busy else FAILURE_CONFIGS.get(failure_code, FAILURE_CONFIGS["PAYMENT_DB_TIMEOUT"])

        # Invoke Telegram AMT payment microservice so money is deducted & Telegram receipt arrives
        user_rec = db.query(User).filter(User.user_id == req.user_id).first()
        phone_to_notify = user_rec.mobile if (user_rec and user_rec.mobile) else "9080189795"
        order_ref = req.order_id
        payment_ref = payment_id
        notified_phone = "9080189795"
        try:
            amt_res = requests.post(
                "http://localhost:8002/payment",
                json={"phone_number": phone_to_notify, "total_amount": float(req.amount)},
                timeout=5
            )
            if amt_res.status_code == 200:
                amt_data = amt_res.json()
                if amt_data.get("status") == "success":
                    order_ref = amt_data.get("order_reference", req.order_id)
                    payment_ref = amt_data.get("payment_reference", payment_id)
                    notified_phone = amt_data.get("notified_phone", "9080189795")
        except Exception as e:
            print(f"AMT payment service call exception: {e}")

        # 1. Store failed payment record in DB
        pay_rec = Payment(
            payment_id=payment_ref,
            order_id=order_ref,
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
            message=f"Payment execution failed for order {order_ref}: {cfg['error_message']}",
            request_id=request_id,
            user_id=req.user_id,
            error_code=failure_code,
            metadata={"payment_id": payment_ref, "amount": req.amount}
        )

        # 3. Store operational event (FAILED, HIGH/CRITICAL)
        op_event = record_operational_event(
            db,
            service_name="payment-service",
            event_type="DB_CONNECTION_LIMIT_EXCEEDED" if db_busy else "PAYMENT_FAILURE",
            status="FAILED",
            severity=cfg["severity"],
            request_id=request_id,
            user_id=req.user_id,
            response_time_ms=cfg["response_time_ms"],
            error_code=failure_code,
            error_message=cfg["error_message"],
            dependency=cfg["dependency"],
            metadata={
                "payment_id": payment_ref,
                "order_id": order_ref,
                "amount": req.amount,
                "payment_method": req.payment_method
            }
        )

        # Dispatch alert to Monitoring Service and Agent
        alert_payload = {
            "service_name": "payment-service",
            "alert_type": "DB_CONNECTION_LIMIT_EXCEEDED",
            "error_code": failure_code,
            "message": f"CRITICAL: Database request timed out for user {req.user_id}. DB connection pool 100% busy. Call restart_db_connections tool, inspect unplaced paid orders with inspect_unplaced_paid_orders tool, and fulfill missing order for user {req.user_id} using place_missing_order tool.",
            "response_time_ms": cfg["response_time_ms"]
        }
        try:
            requests.post("http://localhost:8002/report-alert", json=alert_payload, timeout=2)
        except Exception:
            pass

        # Fallback direct call to Agent on Port 9000
        try:
            requests.post("http://localhost:9000/agent/run", json={
                "incident_id": f"INC-DB-{uuid.uuid4().hex[:4]}",
                "prompt": alert_payload["message"]
            }, timeout=3)
        except Exception:
            pass

        return {
            "success": False,
            "payment_id": payment_ref,
            "order_id": order_ref,
            "status": "FAILED",
            "request_id": request_id,
            "event_id": op_event.event_id,
            "error_code": failure_code,
            "error_message": cfg["error_message"]
        }

    # Fetch user mobile for Telegram notification
    user_rec = db.query(User).filter(User.user_id == req.user_id).first()
    phone_to_notify = user_rec.mobile if (user_rec and user_rec.mobile) else "9080189795"

    order_ref = req.order_id
    payment_ref = payment_id
    telegram_sent = False
    notified_phone = "9080189795"

    # Invoke Telegram AMT payment microservice on port 8002
    try:
        amt_res = requests.post(
            "http://localhost:8002/payment",
            json={"phone_number": phone_to_notify, "total_amount": float(req.amount)},
            timeout=5
        )
        if amt_res.status_code == 200:
            amt_data = amt_res.json()
            if amt_data.get("status") == "success":
                order_ref = amt_data.get("order_reference", req.order_id)
                payment_ref = amt_data.get("payment_reference", payment_id)
                notified_phone = amt_data.get("notified_phone", "9080189795")
                telegram_sent = True
    except Exception as e:
        print(f"AMT payment service call exception: {e}")

    # Successful payment simulation
    pay_rec = Payment(
        payment_id=payment_ref,
        order_id=order_ref,
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
        message=f"Payment {payment_ref} processed successfully for order {order_ref}. Telegram confirmation dispatched to {notified_phone}",
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
        dependency="telegram-payment-service",
        metadata={
            "payment_id": payment_ref,
            "order_id": order_ref,
            "amount": req.amount,
            "notified_phone": notified_phone,
            "telegram_sent": telegram_sent
        }
    )

    return {
        "success": True,
        "payment_id": payment_ref,
        "order_id": order_ref,
        "order_reference": order_ref,
        "payment_reference": payment_ref,
        "notified_phone": notified_phone,
        "telegram_sent": telegram_sent,
        "status": "SUCCESS",
        "request_id": request_id
    }

