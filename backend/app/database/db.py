from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base = declarative_base()

if __name__ == "__main__":
    try:
        with engine.connect() as connection:
            print(" Successfully connected to the Supabase database!")
    except Exception as e:
        print(f" Failed to connect to the database. Error: {e}")
