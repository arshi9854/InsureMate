"""
Database models for HealthCost AI
SQLAlchemy models for production-ready data persistence
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    """User model for authentication and tracking"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_premium = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    predictions = relationship("Prediction", back_populates="user")

class Prediction(Base):
    """Prediction model to store all prediction requests and results"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Input parameters
    age = Column(Integer, nullable=False)
    sex = Column(String, nullable=False)
    bmi = Column(Float, nullable=False)
    children = Column(Integer, nullable=False)
    smoker = Column(String, nullable=False)
    region = Column(String, nullable=False)
    
    # Prediction results
    predicted_cost = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    
    # Metadata
    model_version = Column(String, default="1.0.0")
    prediction_time_ms = Column(Float)  # Response time in milliseconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="predictions")

class ModelPerformance(Base):
    """Model performance tracking for MLOps"""
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    model_version = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    mae = Column(Float, nullable=False)
    
    # Performance metadata
    training_date = Column(DateTime(timezone=True), nullable=False)
    dataset_size = Column(Integer, nullable=False)
    feature_importance = Column(Text)  # JSON string of feature importance
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class APIMetrics(Base):
    """API performance and usage metrics"""
    __tablename__ = "api_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False)
    status_code = Column(Integer, nullable=False)
    response_time_ms = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String, nullable=False)
    user_agent = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class HealthInsights(Base):
    """Store health insights and recommendations"""
    __tablename__ = "health_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    
    # Risk factors analysis
    smoking_risk_score = Column(Float, nullable=False)
    bmi_risk_score = Column(Float, nullable=False)
    age_risk_score = Column(Float, nullable=False)
    
    # Personalized recommendations
    recommendations = Column(Text)  # JSON string of recommendations
    potential_savings = Column(Float)  # Estimated cost savings
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())