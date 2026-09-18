from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from app.database.session import Base

class ApplicationLog(Base):
    __tablename__ = "application_logs"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(String(64), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    service_name = Column(String(64), index=True, nullable=False)
    level = Column(String(16), index=True, nullable=False) # DEBUG, INFO, WARNING, ERROR, CRITICAL
    message = Column(Text, nullable=False)
    request_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), nullable=True)
    error_code = Column(String(64), index=True, nullable=True)
    metadata_json = Column(JSON, nullable=True)
