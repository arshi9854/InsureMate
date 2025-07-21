"""
Test suite for HealthCost AI Backend
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.main_simple import app
except ImportError:
    from backend.app.main_simple import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "HealthCost AI API"
    assert data["version"] == "2.0.0"
    assert data["status"] == "healthy"

def test_predict_endpoint():
    """Test the prediction endpoint with valid data"""
    test_data = {
        "age": 30,
        "sex": "male",
        "bmi": 25.0,
        "children": 2,
        "smoker": "no",
        "region": "northeast"
    }
    
    response = client.post(
        "/predict",
        json=test_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "predicted_cost" in data
    assert "risk_category" in data
    assert "confidence_score" in data
    assert "factors" in data
    assert data["predicted_cost"] > 0

def test_predict_endpoint_invalid_data():
    """Test the prediction endpoint with invalid data"""
    test_data = {
        "age": 150,  # Invalid age
        "sex": "invalid",  # Invalid sex
        "bmi": -5.0,  # Invalid BMI
        "children": -1,  # Invalid children count
        "smoker": "maybe",  # Invalid smoker status
        "region": "mars"  # Invalid region
    }
    
    response = client.post(
        "/predict",
        json=test_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 422  # Validation error

def test_health_metrics_endpoint():
    """Test the health metrics endpoint"""
    response = client.get(
        "/health-metrics",
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "total_predictions" in data
    assert "average_cost" in data
    assert "high_risk_percentage" in data
    assert "model_accuracy" in data

def test_risk_factors_endpoint():
    """Test the risk factors endpoint"""
    response = client.get("/risk-factors")
    
    assert response.status_code == 200
    data = response.json()
    assert "factors" in data
    assert len(data["factors"]) > 0
    
    # Check first factor structure
    factor = data["factors"][0]
    assert "name" in factor
    assert "impact" in factor
    assert "description" in factor

def test_unauthorized_access():
    """Test endpoints without authorization"""
    response = client.post("/predict", json={})
    assert response.status_code == 403  # Forbidden without auth

def test_smoking_impact_prediction():
    """Test that smoking significantly increases prediction"""
    base_data = {
        "age": 30,
        "sex": "male",
        "bmi": 25.0,
        "children": 0,
        "region": "northeast"
    }
    
    # Non-smoker prediction
    non_smoker_data = {**base_data, "smoker": "no"}
    response1 = client.post(
        "/predict",
        json=non_smoker_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    # Smoker prediction
    smoker_data = {**base_data, "smoker": "yes"}
    response2 = client.post(
        "/predict",
        json=smoker_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    assert response1.status_code == 200
    assert response2.status_code == 200
    
    non_smoker_cost = response1.json()["predicted_cost"]
    smoker_cost = response2.json()["predicted_cost"]
    
    # Smoker should have significantly higher cost
    assert smoker_cost > non_smoker_cost * 2