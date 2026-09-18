from app.database.session import engine, Base
import app.models # Ensures all models are registered

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()
