from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.product import Product

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("")
def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category and category != "All":
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
    
    products = query.all()
    return products

@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.product_id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found.")
    return prod
