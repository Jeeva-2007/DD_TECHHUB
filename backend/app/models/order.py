from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. ORD-1001
    user_id = Column(String(64), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(32), default="CONFIRMED") # CONFIRMED, PROCESSING, SHIPPED, DELIVERED
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.order_id"), nullable=False)
    product_id = Column(String(64), nullable=False)
    product_name = Column(String(200), nullable=True)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
