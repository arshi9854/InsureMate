"""
Test suite for ML Service
Comprehensive testing of machine learning pipeline
"""

import pytest
import numpy as np
from unittest.mock import Mock, patch
import sys
import os

# Add the parent directory to the path so we can import the service
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.services.ml_service import MLModelService
except ImportError:
    from backend.app.services.ml_service import MLModelService

class TestMLModelService:
    """Test cases for ML Model Service"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.ml_service = MLModelService()
        self.sample_features = {
            "age": 30,
            "sex": "male",
            "bmi": 25.0,
            "children": 2,
            "smoker": "no",
            "region": "northeast"
        }
    
    def test_fallback_prediction(self):
        """Test fallback prediction when ML models are not available"""
        result = self.ml_service.fallback_prediction(self.sample_features)
        
        assert "predicted_cost" in result
        assert "risk_category" in result
        assert "confidence_score" in result
        assert "factors" in result
        
        assert result["predicted_cost"] > 0
        assert result["confidence_score"] > 0
        assert result["confidence_score"] <= 1
        assert result["risk_category"] in ["Low Risk", "Medium Risk", "High Risk", "Very High Risk"]
    
    def test_smoking_impact(self):
        """Test that smoking significantly increases predicted cost"""
        non_smoker = self.sample_features.copy()
        non_smoker["smoker"] = "no"
        
        smoker = self.sample_features.copy()
        smoker["smoker"] = "yes"
        
        non_smoker_result = self.ml_service.fallback_prediction(non_smoker)
        smoker_result = self.ml_service.fallback_prediction(smoker)
        
        assert smoker_result["predicted_cost"] > non_smoker_result["predicted_cost"]
        assert smoker_result["factors"]["smoking_impact"] > 0
        assert non_smoker_result["factors"]["smoking_impact"] == 0
    
    def test_bmi_impact(self):
        """Test BMI impact on prediction"""
        normal_bmi = self.sample_features.copy()
        normal_bmi["bmi"] = 22.0
        
        obese_bmi = self.sample_features.copy()
        obese_bmi["bmi"] = 35.0
        
        normal_result = self.ml_service.fallback_prediction(normal_bmi)
        obese_result = self.ml_service.fallback_prediction(obese_bmi)
        
        assert obese_result["predicted_cost"] > normal_result["predicted_cost"]
        assert obese_result["factors"]["bmi_impact"] > normal_result["factors"]["bmi_impact"]
    
    def test_age_impact(self):
        """Test age impact on prediction"""
        young = self.sample_features.copy()
        young["age"] = 25
        
        older = self.sample_features.copy()
        older["age"] = 55
        
        young_result = self.ml_service.fallback_prediction(young)
        older_result = self.ml_service.fallback_prediction(older)
        
        assert older_result["predicted_cost"] > young_result["predicted_cost"]
        assert older_result["factors"]["age_impact"] > young_result["factors"]["age_impact"]
    
    def test_children_impact(self):
        """Test children count impact on prediction"""
        no_children = self.sample_features.copy()
        no_children["children"] = 0
        
        many_children = self.sample_features.copy()
        many_children["children"] = 5
        
        no_children_result = self.ml_service.fallback_prediction(no_children)
        many_children_result = self.ml_service.fallback_prediction(many_children)
        
        assert many_children_result["predicted_cost"] > no_children_result["predicted_cost"]
        assert many_children_result["factors"]["children_impact"] > no_children_result["factors"]["children_impact"]
    
    def test_region_impact(self):
        """Test regional differences in prediction"""
        regions = ["northeast", "northwest", "southeast", "southwest"]
        results = {}
        
        for region in regions:
            features = self.sample_features.copy()
            features["region"] = region
            results[region] = self.ml_service.fallback_prediction(features)
        
        # Check that different regions produce different costs
        costs = [results[region]["predicted_cost"] for region in regions]
        assert len(set(costs)) > 1  # At least some variation
    
    def test_risk_category_determination(self):
        """Test risk category determination logic"""
        # Test low risk
        low_cost = 5000
        assert self.ml_service.determine_risk_category(low_cost) == "Low Risk"
        
        # Test medium risk
        medium_cost = 12000
        assert self.ml_service.determine_risk_category(medium_cost) == "Medium Risk"
        
        # Test high risk
        high_cost = 20000
        assert self.ml_service.determine_risk_category(high_cost) == "High Risk"
        
        # Test very high risk
        very_high_cost = 30000
        assert self.ml_service.determine_risk_category(very_high_cost) == "Very High Risk"
    
    def test_prepare_single_prediction_features(self):
        """Test feature preparation for single prediction"""
        feature_vector = self.ml_service.prepare_single_prediction_features(self.sample_features)
        
        # Should return a list of numeric values
        assert isinstance(feature_vector, list)
        assert all(isinstance(x, (int, float)) for x in feature_vector)
        assert len(feature_vector) > 10  # Should have multiple features
    
    def test_factor_breakdown(self):
        """Test factor breakdown calculation"""
        factors = self.ml_service.get_factor_breakdown(self.sample_features, 15000)
        
        required_factors = ["base_cost", "age_impact", "bmi_impact", "smoking_impact", "children_impact", "region_impact"]
        
        for factor in required_factors:
            assert factor in factors
            assert isinstance(factors[factor], (int, float))
    
    def test_model_loading_success(self):
        """Test successful model loading"""
        # Test that the service initializes properly
        ml_service = MLModelService()
        assert ml_service is not None
        assert hasattr(ml_service, 'feature_importance')
        assert hasattr(ml_service, 'model_weights')
    
    def test_model_loading_failure(self):
        """Test model loading failure fallback"""
        # Test that fallback prediction works
        ml_service = MLModelService()
        result = ml_service.predict_ensemble(self.sample_features)
        assert "predicted_cost" in result
    
    def test_ensemble_prediction_consistency(self):
        """Test that ensemble predictions are consistent"""
        result1 = self.ml_service.predict_ensemble(self.sample_features)
        result2 = self.ml_service.predict_ensemble(self.sample_features)
        
        # Same input should produce same output
        assert result1["predicted_cost"] == result2["predicted_cost"]
        assert result1["risk_category"] == result2["risk_category"]
    
    def test_extreme_values_handling(self):
        """Test handling of extreme input values"""
        extreme_features = {
            "age": 100,
            "sex": "female",
            "bmi": 60.0,
            "children": 10,
            "smoker": "yes",
            "region": "northeast"
        }
        
        result = self.ml_service.predict_ensemble(extreme_features)
        
        # Should still produce valid output
        assert result["predicted_cost"] > 0
        assert result["risk_category"] in ["Low Risk", "Medium Risk", "High Risk", "Very High Risk"]
        assert 0 < result["confidence_score"] <= 1
    
    def test_prediction_performance(self):
        """Test prediction performance (should be fast)"""
        import time
        
        start_time = time.time()
        result = self.ml_service.predict_ensemble(self.sample_features)
        end_time = time.time()
        
        prediction_time = end_time - start_time
        
        # Prediction should complete in under 1 second
        assert prediction_time < 1.0
        assert "predicted_cost" in result

@pytest.fixture
def sample_prediction_data():
    """Fixture for sample prediction data"""
    return {
        "age": 35,
        "sex": "female",
        "bmi": 28.5,
        "children": 1,
        "smoker": "no",
        "region": "southeast"
    }

class TestMLServiceIntegration:
    """Integration tests for ML service"""
    
    def test_prediction_pipeline_end_to_end(self, sample_prediction_data):
        """Test complete prediction pipeline"""
        ml_service = MLModelService()
        
        # Test prediction
        result = ml_service.predict_ensemble(sample_prediction_data)
        
        # Validate result structure
        assert isinstance(result, dict)
        required_keys = ["predicted_cost", "risk_category", "confidence_score", "factors"]
        for key in required_keys:
            assert key in result
        
        # Validate data types
        assert isinstance(result["predicted_cost"], (int, float))
        assert isinstance(result["risk_category"], str)
        assert isinstance(result["confidence_score"], (int, float))
        assert isinstance(result["factors"], dict)
        
        # Validate ranges
        assert result["predicted_cost"] > 0
        assert 0 < result["confidence_score"] <= 1
    
    def test_batch_predictions(self):
        """Test batch prediction capability"""
        ml_service = MLModelService()
        
        test_cases = [
            {"age": 25, "sex": "male", "bmi": 22.0, "children": 0, "smoker": "no", "region": "northeast"},
            {"age": 45, "sex": "female", "bmi": 32.0, "children": 2, "smoker": "yes", "region": "southeast"},
            {"age": 35, "sex": "male", "bmi": 28.0, "children": 1, "smoker": "no", "region": "southwest"}
        ]
        
        results = []
        for case in test_cases:
            result = ml_service.predict_ensemble(case)
            results.append(result)
        
        # All predictions should be valid
        assert len(results) == len(test_cases)
        for result in results:
            assert "predicted_cost" in result
            assert result["predicted_cost"] > 0
    
    def test_model_robustness(self):
        """Test model robustness with various inputs"""
        ml_service = MLModelService()
        
        # Test with boundary values
        boundary_cases = [
            {"age": 18, "sex": "male", "bmi": 15.0, "children": 0, "smoker": "no", "region": "northeast"},
            {"age": 64, "sex": "female", "bmi": 40.0, "children": 5, "smoker": "yes", "region": "southwest"}
        ]
        
        for case in boundary_cases:
            result = ml_service.predict_ensemble(case)
            assert result["predicted_cost"] > 0
            assert result["confidence_score"] > 0