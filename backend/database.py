import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Use DATABASE_URL from environment (Render sets this automatically)
# Falls back to SQLite for local development (no MS SQL setup needed locally)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./flowmind.db"  # local fallback
)

# SQLite needs special connect_args; other DBs don't
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    # PostgreSQL (Render) or MS SQL Server
    engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
