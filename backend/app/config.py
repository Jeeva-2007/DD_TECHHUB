import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dd_techhub.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dd_techhub_secret_key_2026_super_secure_key")
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
