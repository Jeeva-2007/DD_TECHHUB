from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.product import Product

router = APIRouter(prefix="/api/cart", tags=["Cart"])

# In-memory session cart store per user for prototype simplicity
CART_STORE = {}

class CartAddRequest(BaseModel):
    user_id: str
    product_id: str
    quantity: int = 1

class CartUpdateRequest(BaseModel):
    user_id: str
    quantity: int

@router.get("")
def get_cart(user_id: str = "GUEST", db: Session = Depends(get_db)):
    items = CART_STORE.get(user_id, [])
    
    # Calculate subtotal and total
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    delivery_charge = 0.0 if subtotal > 2000 else (99.0 if subtotal > 0 else 0.0)
    discount = 500.0 if subtotal >= 30000 else 0.0
    total = max(0.0, subtotal + delivery_charge - discount)

    return {
        "user_id": user_id,
        "items": items,
        "subtotal": subtotal,
        "delivery_charge": delivery_charge,
        "discount": discount,
        "total": total
    }

@router.post("/items")
def add_cart_item(req: CartAddRequest, db: Session = Depends(get_db)):
    user_cart = CART_STORE.setdefault(req.user_id, [])
    prod = db.query(Product).filter(Product.product_id == req.product_id).first()
    
    if not prod:
        return {"success": False, "message": "Product not found"}
    
    # Check if item already exists
    existing = next((item for item in user_cart if item["product_id"] == req.product_id), None)
    if existing:
        existing["quantity"] += req.quantity
    else:
        user_cart.append({
            "item_id": f"ITEM-{len(user_cart) + 1}",
            "product_id": prod.product_id,
            "name": prod.name,
            "price": prod.price,
            "image_url": prod.image_url,
            "quantity": req.quantity
        })
        
    return get_cart(req.user_id, db)

@router.put("/items/{item_id}")
def update_cart_item(item_id: str, req: CartUpdateRequest, db: Session = Depends(get_db)):
    user_cart = CART_STORE.get(req.user_id, [])
    for item in user_cart:
        if item["item_id"] == item_id or item["product_id"] == item_id:
            if req.quantity <= 0:
                user_cart.remove(item)
            else:
                item["quantity"] = req.quantity
            break
    return get_cart(req.user_id, db)

@router.delete("/items/{item_id}")
def remove_cart_item(item_id: str, user_id: str = "GUEST", db: Session = Depends(get_db)):
    user_cart = CART_STORE.get(user_id, [])
    CART_STORE[user_id] = [item for item in user_cart if item["item_id"] != item_id and item["product_id"] != item_id]
    return get_cart(user_id, db)
