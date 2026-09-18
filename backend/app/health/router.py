from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db

router = APIRouter(prefix="/api/health", tags=["Health"])

@router.get("")
def overall_health(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "auth-service": "healthy",
            "otp-service": "healthy",
            "payment-service": "healthy",
            "order-service": "healthy",
            "product-service": "healthy",
            "database": db_status
        }
    }

@router.get("/auth")
def auth_health():
    return {
        "service": "auth-service",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/otp")
def otp_health():
    return {
        "service": "otp-service",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/payment")
def payment_health():
    return {
        "service": "payment-service",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/database")
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        st = "healthy"
    except Exception:
        st = "unhealthy"

    return {
        "service": "database",
        "status": st,
        "timestamp": datetime.utcnow().isoformat()
    }
