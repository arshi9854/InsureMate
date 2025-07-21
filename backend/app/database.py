"""
Database configuration and connection management
Production-ready database setup with connection pooling
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
try:
    from .models import Base
except ImportError:
    from models import Base
import logging

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://healthcost_user:healthcost_password@localhost:5432/healthcost_ai"
)

# Create engine with connection pooling for production
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # Set to True for SQL debugging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database with sample data"""
    try:
        create_tables()
        
        # Add sample data if needed
        db = SessionLocal()
        
        # Check if we need to add sample users
        try:
            from .models import User
        except ImportError:
            from models import User
            
        if db.query(User).count() == 0:
            sample_user = User(
                email="demo@healthcost.ai",
                username="demo_user",
                hashed_password="$2b$12$sample_hashed_password",
                is_active=True,
                is_premium=False
            )
            db.add(sample_user)
            db.commit()
            logger.info("Sample user created")
        
        db.close()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise