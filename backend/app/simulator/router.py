import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.logging.logger import log_application_event, record_operational_event

router = APIRouter(prefix="/api/simulator", tags=["Development Simulator"])

# --- OTP FAILURE SIMULATIONS ---

@router.post("/otp/provider-timeout")
def simulate_otp_provider_timeout(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="otp-service", level="ERROR",
        message="Demo SMS provider timed out after 5000ms while dispatching OTP",
        request_id=request_id, user_id=user_id, error_code="OTP_PROVIDER_TIMEOUT"
    )
    op_evt = record_operational_event(
        db, service_name="otp-service", event_type="OTP_FAILURE",
        status="FAILED", severity="MEDIUM", request_id=request_id,
        user_id=user_id, response_time_ms=5010,
        error_code="OTP_PROVIDER_TIMEOUT",
        error_message="SMS Gateway gateway read timeout",
        dependency="demo-sms-provider"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "OTP_PROVIDER_TIMEOUT"}

@router.post("/otp/provider-error")
def simulate_otp_provider_error(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="otp-service", level="ERROR",
        message="Demo SMS provider returned HTTP 502 Bad Gateway",
        request_id=request_id, user_id=user_id, error_code="OTP_PROVIDER_ERROR"
    )
    op_evt = record_operational_event(
        db, service_name="otp-service", event_type="OTP_FAILURE",
        status="FAILED", severity="MEDIUM", request_id=request_id,
        user_id=user_id, response_time_ms=320,
        error_code="OTP_PROVIDER_ERROR",
        error_message="Provider upstream failure HTTP 502",
        dependency="demo-sms-provider"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "OTP_PROVIDER_ERROR"}

@router.post("/otp/service-down")
def simulate_otp_service_down(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="otp-service", level="CRITICAL",
        message="OTP microservice container healthcheck failed - process unreachable",
        request_id=request_id, user_id=user_id, error_code="OTP_SERVICE_UNAVAILABLE"
    )
    op_evt = record_operational_event(
        db, service_name="otp-service", event_type="OTP_FAILURE",
        status="FAILED", severity="HIGH", request_id=request_id,
        user_id=user_id, response_time_ms=0,
        error_code="OTP_SERVICE_UNAVAILABLE",
        error_message="Service unavailable / connection refused",
        dependency="otp-service"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "OTP_SERVICE_UNAVAILABLE"}

@router.post("/otp/rate-limit")
def simulate_otp_rate_limit(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="otp-service", level="WARNING",
        message="Too many OTP requests in 60 seconds interval for user",
        request_id=request_id, user_id=user_id, error_code="OTP_RATE_LIMIT_EXCEEDED"
    )
    op_evt = record_operational_event(
        db, service_name="otp-service", event_type="OTP_FAILURE",
        status="FAILED", severity="LOW", request_id=request_id,
        user_id=user_id, response_time_ms=15,
        error_code="OTP_RATE_LIMIT_EXCEEDED",
        error_message="Rate limit 3 reqs/min exceeded",
        dependency="otp-service"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "OTP_RATE_LIMIT_EXCEEDED"}

@router.post("/otp/database-error")
def simulate_otp_database_error(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="otp-service", level="ERROR",
        message="Failed to write OTP session state to persistent store",
        request_id=request_id, user_id=user_id, error_code="OTP_DATABASE_ERROR"
    )
    op_evt = record_operational_event(
        db, service_name="otp-service", event_type="OTP_FAILURE",
        status="FAILED", severity="HIGH", request_id=request_id,
        user_id=user_id, response_time_ms=850,
        error_code="OTP_DATABASE_ERROR",
        error_message="Operational database disk I/O failure",
        dependency="database"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "OTP_DATABASE_ERROR"}

# --- PAYMENT FAILURE SIMULATIONS ---

@router.post("/payment/gateway-timeout")
def simulate_payment_gateway_timeout(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="payment-service", level="ERROR",
        message="Payment gateway HTTP client socket timed out after 5000ms",
        request_id=request_id, user_id=user_id, error_code="PAYMENT_GATEWAY_TIMEOUT"
    )
    op_evt = record_operational_event(
        db, service_name="payment-service", event_type="PAYMENT_FAILURE",
        status="FAILED", severity="HIGH", request_id=request_id,
        user_id=user_id, response_time_ms=5000,
        error_code="PAYMENT_GATEWAY_TIMEOUT",
        error_message="Gateway socket timeout",
        dependency="demo-payment-gateway"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "PAYMENT_GATEWAY_TIMEOUT"}

@router.post("/payment/service-down")
def simulate_payment_service_down(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="payment-service", level="CRITICAL",
        message="Payment worker thread pool exhausted - HTTP 503 Service Unavailable",
        request_id=request_id, user_id=user_id, error_code="PAYMENT_SERVICE_UNAVAILABLE"
    )
    op_evt = record_operational_event(
        db, service_name="payment-service", event_type="PAYMENT_FAILURE",
        status="FAILED", severity="CRITICAL", request_id=request_id,
        user_id=user_id, response_time_ms=120,
        error_code="PAYMENT_SERVICE_UNAVAILABLE",
        error_message="Payment service thread pool exhausted",
        dependency="payment-service"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "PAYMENT_SERVICE_UNAVAILABLE"}

@router.post("/payment/database-error")
def simulate_payment_database_error(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="payment-service", level="ERROR",
        message="Database error occurred while persisting payment authorization",
        request_id=request_id, user_id=user_id, error_code="PAYMENT_DATABASE_ERROR"
    )
    op_evt = record_operational_event(
        db, service_name="payment-service", event_type="PAYMENT_FAILURE",
        status="FAILED", severity="HIGH", request_id=request_id,
        user_id=user_id, response_time_ms=1150,
        error_code="PAYMENT_DATABASE_ERROR",
        error_message="Database lock deadlock on payment table",
        dependency="database"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "PAYMENT_DATABASE_ERROR"}

@router.post("/payment/database-timeout")
def simulate_payment_database_timeout(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="payment-service", level="ERROR",
        message="Database query timed out during payment confirmation lock",
        request_id=request_id, user_id=user_id, error_code="PAYMENT_DB_TIMEOUT"
    )
    op_evt = record_operational_event(
        db, service_name="payment-service", event_type="PAYMENT_FAILURE",
        status="FAILED", severity="HIGH", request_id=request_id,
        user_id=user_id, response_time_ms=3100,
        error_code="PAYMENT_DB_TIMEOUT",
        error_message="Database request timed out",
        dependency="database"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "PAYMENT_DB_TIMEOUT"}

@router.post("/payment/rate-limit")
def simulate_payment_rate_limit(user_id: str = "USR-DEMO", db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    log_application_event(
        db, service_name="payment-service", level="WARNING",
        message="Payment attempts frequency limit reached for user account",
        request_id=request_id, user_id=user_id, error_code="PAYMENT_RATE_LIMIT"
    )
    op_evt = record_operational_event(
        db, service_name="payment-service", event_type="PAYMENT_FAILURE",
        status="FAILED", severity="MEDIUM", request_id=request_id,
        user_id=user_id, response_time_ms=45,
        error_code="PAYMENT_RATE_LIMIT",
        error_message="Maximum card attempts limit exceeded",
        dependency="payment-service"
    )
    return {"success": False, "request_id": request_id, "event_id": op_evt.event_id, "error_code": "PAYMENT_RATE_LIMIT"}
