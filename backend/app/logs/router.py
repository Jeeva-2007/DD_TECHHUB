from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.application_log import ApplicationLog

router = APIRouter(prefix="/api/logs", tags=["Logs"])

@router.get("")
def query_logs(
    service: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    error_code: Optional[str] = Query(None),
    request_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    query = db.query(ApplicationLog)

    if service:
        query = query.filter(ApplicationLog.service_name == service)
    if level:
        query = query.filter(ApplicationLog.level == level.upper())
    if error_code:
        query = query.filter(ApplicationLog.error_code == error_code)
    if request_id:
        query = query.filter(ApplicationLog.request_id == request_id)

    logs = query.order_by(ApplicationLog.id.desc()).limit(limit).all()

    return [
        {
            "id": log.id,
            "log_id": log.log_id,
            "timestamp": log.timestamp.isoformat(),
            "service_name": log.service_name,
            "level": log.level,
            "message": log.message,
            "request_id": log.request_id,
            "user_id": log.user_id,
            "error_code": log.error_code,
            "metadata": log.metadata_json
        }
        for log in logs
    ]
