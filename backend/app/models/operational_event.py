from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from datetime import datetime
from app.database.session import Base

class OperationalEvent(Base):
    __tablename__ = "operational_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    request_id = Column(String(64), index=True, nullable=False)
    user_id = Column(String(64), nullable=True)
    service_name = Column(String(64), index=True, nullable=False)
    event_type = Column(String(64), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, default=datetime.utcnow)
    status = Column(String(32), nullable=False) # SUCCESS, FAILED
    severity = Column(String(16), index=True, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    response_time_ms = Column(Integer, default=0)
    metric_name = Column(String(64), nullable=True)
    metric_value = Column(Float, nullable=True)
    threshold = Column(Float, nullable=True)
    error_code = Column(String(64), index=True, nullable=True)
    error_message = Column(Text, nullable=True)
    dependency = Column(String(64), nullable=True)
    metadata_json = Column(JSON, nullable=True)
