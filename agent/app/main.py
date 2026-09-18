import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.db.database import init_db
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables on application startup
    init_db()
    logging.info("[SYSTEM] Database initialized successfully.")
    yield

app = FastAPI(
    title="Enterprise Incident Resolution AI Agent",
    description="Event-driven enterprise incident investigation agent using LangGraph, FastAPI, and SQLite.",
    version="0.1.0",
    lifespan=lifespan
)

app.include_router(router)

@app.get("/")
async def root():
    return {
        "service": "Enterprise Incident Resolution AI Agent",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
