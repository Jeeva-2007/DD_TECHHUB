from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), unique=True, index=True) # e.g. USR-101
    name = Column(String(100), nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

