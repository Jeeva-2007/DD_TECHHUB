from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.init_db import init_db
from app.auth.router import router as auth_router
from app.otp.router import router as otp_router
from app.products.router import router as products_router
from app.cart.router import router as cart_router
from app.orders.router import router as orders_router
from app.payment.router import router as payment_router
from app.health.router import router as health_router
from app.logs.router import router as logs_router
from app.events.router import router as events_router
from app.simulator.router import router as simulator_router
from app.actions.router import router as actions_router

app = FastAPI(
    title="DD TECHHUB Enterprise Backend",
    description="Backend services & operational log/event generation engine for DD TECHHUB",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(otp_router)
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(payment_router)
app.include_router(health_router)
app.include_router(logs_router)
app.include_router(events_router)
app.include_router(simulator_router)
app.include_router(actions_router)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {
        "brand": "DD TECHHUB",
        "tagline": "Smart Tech. Simple Choice.",
        "status": "Operational",
        "docs_url": "/docs"
    }
