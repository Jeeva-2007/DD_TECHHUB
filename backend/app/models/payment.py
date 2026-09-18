from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database.session import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. PAY-10001
    order_id = Column(String(64), nullable=False)
    user_id = Column(String(64), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(32), nullable=False) # SUCCESS, FAILED
    payment_method = Column(String(32), default="CARD")
    error_code = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
