from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.operational_event import OperationalEvent

router = APIRouter(prefix="/api/events", tags=["Operational Events"])

@router.get("")
def query_events(
    service: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    error_code: Optional[str] = Query(None),
    request_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    query = db.query(OperationalEvent)

    if service:
        query = query.filter(OperationalEvent.service_name == service)
    if event_type:
        query = query.filter(OperationalEvent.event_type == event_type)
    if severity:
        query = query.filter(OperationalEvent.severity == severity.upper())
    if status:
        query = query.filter(OperationalEvent.status == status.upper())
    if error_code:
        query = query.filter(OperationalEvent.error_code == error_code)
    if request_id:
        query = query.filter(OperationalEvent.request_id == request_id)

    events = query.order_by(OperationalEvent.id.desc()).limit(limit).all()

    return [
        {
            "id": evt.id,
            "event_id": evt.event_id,
            "request_id": evt.request_id,
            "user_id": evt.user_id,
            "service_name": evt.service_name,
            "event_type": evt.event_type,
            "timestamp": evt.timestamp.isoformat(),
            "status": evt.status,
            "severity": evt.severity,
            "response_time_ms": evt.response_time_ms,
            "metric_name": evt.metric_name,
            "metric_value": evt.metric_value,
            "threshold": evt.threshold,
            "error_code": evt.error_code,
            "error_message": evt.error_message,
            "dependency": evt.dependency,
            "metadata": evt.metadata_json
        }
        for evt in events
    ]

@router.get("/{event_id}")
def get_event_by_id(event_id: str, db: Session = Depends(get_db)):
    evt = db.query(OperationalEvent).filter(OperationalEvent.event_id == event_id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Operational event not found.")
    return {
        "id": evt.id,
        "event_id": evt.event_id,
        "request_id": evt.request_id,
        "user_id": evt.user_id,
        "service_name": evt.service_name,
        "event_type": evt.event_type,
        "timestamp": evt.timestamp.isoformat(),
        "status": evt.status,
        "severity": evt.severity,
        "response_time_ms": evt.response_time_ms,
        "metric_name": evt.metric_name,
        "metric_value": evt.metric_value,
        "threshold": evt.threshold,
        "error_code": evt.error_code,
        "error_message": evt.error_message,
        "dependency": evt.dependency,
        "metadata": evt.metadata_json
    }
