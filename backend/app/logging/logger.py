import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.application_log import ApplicationLog
from app.models.operational_event import OperationalEvent

def log_application_event(
    db: Session,
    service_name: str,
    level: str,
    message: str,
    request_id: str = None,
    user_id: str = None,
    error_code: str = None,
    metadata: dict = None
) -> ApplicationLog:
    """Creates a structured application log entry in the database."""
    log_id = f"LOG-{uuid.uuid4().hex[:8].upper()}"
    log_entry = ApplicationLog(
        log_id=log_id,
        timestamp=datetime.utcnow(),
        service_name=service_name,
        level=level.upper(),
        message=message,
        request_id=request_id or f"REQ-{uuid.uuid4().hex[:6].upper()}",
        user_id=user_id,
        error_code=error_code,
        metadata_json=metadata or {}
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def record_operational_event(
    db: Session,
    service_name: str,
    event_type: str,
    status: str, # SUCCESS, FAILED
    severity: str, # LOW, MEDIUM, HIGH, CRITICAL
    request_id: str,
    user_id: str = None,
    event_id: str = None,
    response_time_ms: int = 150,
    error_code: str = None,
    error_message: str = None,
    dependency: str = None,
    metadata: dict = None,
    metric_name: str = None,
    metric_value: float = None,
    threshold: float = None
) -> OperationalEvent:
    """Creates a structured operational event entry in the database."""
    if not event_id:
        evt_prefix = "EVT-OTP" if "OTP" in event_type else ("EVT-PAY" if "PAYMENT" in event_type else "EVT-SYS")
        event_id = f"{evt_prefix}-{uuid.uuid4().hex[:6].upper()}"

    op_event = OperationalEvent(
        event_id=event_id,
        request_id=request_id,
        user_id=user_id,
        service_name=service_name,
        event_type=event_type,
        timestamp=datetime.utcnow(),
        status=status.upper(),
        severity=severity.upper(),
        response_time_ms=response_time_ms,
        metric_name=metric_name,
        metric_value=metric_value,
        threshold=threshold,
        error_code=error_code,
        error_message=error_message,
        dependency=dependency,
        metadata_json=metadata or {}
    )
    db.add(op_event)
    db.commit()
    db.refresh(op_event)
    return op_event
