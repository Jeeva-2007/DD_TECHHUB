import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.order import Order, OrderItem
from app.logging.logger import log_application_event, record_operational_event

router = APIRouter(prefix="/api/orders", tags=["Orders"])

class OrderItemSchema(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class CreateOrderRequest(BaseModel):
    user_id: str
    total_amount: float
    items: List[OrderItemSchema]
    address: dict

@router.post("")
def create_order(req: CreateOrderRequest, db: Session = Depends(get_db)):
    request_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    order_id = f"ORD-{uuid.uuid4().hex[:6].upper()}"

    order = Order(
        order_id=order_id,
        user_id=req.user_id,
        total_amount=req.total_amount,
        status="CONFIRMED"
    )
    db.add(order)

    for item in req.items:
        order_item = OrderItem(
            order_id=order_id,
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            price=item.price
        )
        db.add(order_item)

    db.commit()

    log_application_event(
        db, service_name="order-service", level="INFO",
        message=f"Order {order_id} created for user {req.user_id} with total amount ₹{req.total_amount:,.2f}",
        request_id=request_id, user_id=req.user_id
    )

    record_operational_event(
        db, service_name="order-service", event_type="ORDER_CREATE",
        status="SUCCESS", severity="LOW", request_id=request_id,
        user_id=req.user_id, response_time_ms=140,
        metadata={"order_id": order_id, "item_count": len(req.items)}
    )

    return {
        "success": True,
        "order_id": order_id,
        "request_id": request_id,
        "total_amount": req.total_amount,
        "status": "CONFIRMED"
    }

@router.get("/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    return {
        "order_id": order.order_id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "items": [
            {
                "product_id": it.product_id,
                "product_name": it.product_name,
                "quantity": it.quantity,
                "price": it.price
            } for it in items
        ],
        "delivery_steps": [
            {"step": "Order Confirmed", "status": "COMPLETED", "timestamp": order.created_at.strftime("%b %d, %H:%M")},
            {"step": "Processing", "status": "IN_PROGRESS", "timestamp": "Estimated within 24h"},
            {"step": "Shipped", "status": "PENDING", "timestamp": "Pending"},
            {"step": "Delivered", "status": "PENDING", "timestamp": "Expected in 2-3 days"}
        ]
    }

@router.get("/user/{user_id}")
def get_user_orders(user_id: str, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.id.desc()).all()
    result = []
    for order in orders:
        items = db.query(OrderItem).filter(OrderItem.order_id == order.order_id).all()
        result.append({
            "order_id": order.order_id,
            "user_id": order.user_id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at.isoformat() if hasattr(order.created_at, "isoformat") else str(order.created_at),
            "items": [
                {
                    "product_id": it.product_id,
                    "product_name": it.product_name,
                    "quantity": it.quantity,
                    "price": it.price
                } for it in items
            ]
        })
    return {"orders": result}
