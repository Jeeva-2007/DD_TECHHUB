from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from datetime import datetime
from app.database.session import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(64), unique=True, index=True) # e.g. PROD-101
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False) # Laptops or Accessories
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=50)
    rating = Column(Float, default=4.5)
    image_url = Column(Text, nullable=False)
    
    # Detailed Specs for Product Details page
    processor = Column(String(100), nullable=True)
    ram = Column(String(50), nullable=True)
    storage = Column(String(50), nullable=True)
    display = Column(String(100), nullable=True)
    graphics = Column(String(100), nullable=True)
    os = Column(String(50), nullable=True)
    warranty = Column(String(100), nullable=True)
    delivery = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
