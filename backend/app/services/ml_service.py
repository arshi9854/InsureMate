"""
Machine Learning Service
Advanced ML pipeline with model management and monitoring
"""

import numpy as np
import json
from typing import Dict, List, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MLModelService:
    """Advanced ML service with ensemble models and monitoring"""
    
    def __init__(self):
        self.models = {}
        self.model_weights = {}
        self.feature_importance = {}
        self.model_version = "1.0.0"
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models or train new ones"""
        try:
            # For demo purposes, use fallback prediction
            # In production, this would load actual trained models
            logger.info("Using fallback prediction for demo")
            self.models = None
            
            # Set up demo feature importance
            self.feature_importance = {
                "smoking": 0.45,
                "bmi": 0.25,
                "age": 0.15,
                "region": 0.10,
                "children": 0.05
            }
            
            # Set up demo model weights
            self.model_weights = {
                "random_forest": 0.4,
                "gradient_boost": 0.35,
                "linear_regression": 0.25
            }
            
        except Exception as e:
            logger.warning(f"Could not load models: {e}. Using fallback prediction.")
            self.models = None
    
    def train_models(self):
        """Train ensemble of ML models - Demo version"""
        # For demo purposes, we'll use the fallback prediction
        # In production, this would train actual ML models
        logger.info("Demo version - using fallback prediction")
        self.models = None
    
    def predict_ensemble(self, features: Dict) -> Dict:
        """Make prediction using ensemble of models"""
        if not self.models:
            return self.fallback_prediction(features)
        
        try:
            # Prepare features
            feature_vector = self.prepare_single_prediction_features(features)
            
            # Get predictions from all models
            predictions = {}
            for name, model in self.models.items():
                pred = model.predict([feature_vector])[0]
                predictions[name] = pred
            
            # Weighted ensemble prediction
            ensemble_pred = sum(
                pred * self.model_weights.get(name, 1/len(predictions))
                for name, pred in predictions.items()
            )
            
            # Calculate confidence based on prediction variance
            pred_variance = np.var(list(predictions.values()))
            confidence = max(0.7, min(0.95, 1 - (pred_variance / ensemble_pred)))
            
            # Determine risk category
            risk_category = self.determine_risk_category(ensemble_pred)
            
            # Get factor breakdown
            factors = self.get_factor_breakdown(features, ensemble_pred)
            
            return {
                "predicted_cost": round(ensemble_pred, 2),
                "risk_category": risk_category,
                "confidence_score": round(confidence, 3),
                "factors": factors,
                "model_predictions": {k: round(v, 2) for k, v in predictions.items()},
                "feature_importance": self.feature_importance
            }
            
        except Exception as e:
            logger.error(f"Ensemble prediction error: {e}")
            return self.fallback_prediction(features)
    
    def prepare_single_prediction_features(self, features: Dict) -> List[float]:
        """Prepare features for a single prediction"""
        # Base features
        feature_vector = [
            features['age'],
            features['bmi'],
            features['children'],
            1 if features['sex'] == 'male' else 0,
            1 if features['smoker'] == 'yes' else 0,
        ]
        
        # BMI categories
        feature_vector.extend([
            1 if features['bmi'] >= 30 else 0,  # obese
            1 if 25 <= features['bmi'] < 30 else 0,  # overweight
        ])
        
        # Age categories
        feature_vector.extend([
            1 if features['age'] >= 55 else 0,  # senior
            1 if 35 <= features['age'] < 55 else 0,  # middle
        ])
        
        # Interaction features
        smoker_val = 1 if features['smoker'] == 'yes' else 0
        feature_vector.extend([
            smoker_val * features['bmi'],  # smoker_bmi_interaction
            features['age'] * smoker_val,  # age_smoker_interaction
        ])
        
        # Region encoding (one-hot)
        regions = ['northeast', 'northwest', 'southeast', 'southwest']
        for region in regions:
            feature_vector.append(1 if features['region'] == region else 0)
        
        return feature_vector
    
    def determine_risk_category(self, predicted_cost: float) -> str:
        """Determine risk category based on predicted cost"""
        if predicted_cost > 25000:
            return "Very High Risk"
        elif predicted_cost > 15000:
            return "High Risk"
        elif predicted_cost > 8000:
            return "Medium Risk"
        else:
            return "Low Risk"
    
    def get_factor_breakdown(self, features: Dict, total_cost: float) -> Dict:
        """Calculate factor breakdown for explainability"""
        base_cost = 3000
        
        # Age impact
        age_impact = (features['age'] - 18) * 100
        
        # BMI impact
        if features['bmi'] > 30:
            bmi_impact = (features['bmi'] - 30) * 300
        elif features['bmi'] > 25:
            bmi_impact = (features['bmi'] - 25) * 100
        else:
            bmi_impact = 0
        
        # Smoking impact (major factor)
        smoking_impact = 18000 if features['smoker'] == 'yes' else 0
        
        # Children impact
        children_impact = features['children'] * 600
        
        # Region impact
        region_multipliers = {
            'northeast': 1.1,
            'northwest': 1.0,
            'southeast': 1.05,
            'southwest': 0.95
        }
        region_impact = (region_multipliers.get(features['region'], 1.0) - 1.0) * base_cost
        
        return {
            "base_cost": base_cost,
            "age_impact": round(age_impact, 2),
            "bmi_impact": round(bmi_impact, 2),
            "smoking_impact": round(smoking_impact, 2),
            "children_impact": round(children_impact, 2),
            "region_impact": round(region_impact, 2)
        }
    
    def fallback_prediction(self, features: Dict) -> Dict:
        """Fallback prediction when ML models are not available"""
        # Simple rule-based prediction
        base_cost = 3000
        
        # Age factor
        age_factor = features['age'] * 80
        
        # BMI factor
        if features['bmi'] > 30:
            bmi_factor = (features['bmi'] - 30) * 400
        else:
            bmi_factor = max(0, (features['bmi'] - 18.5) * 50)
        
        # Smoking factor (major impact)
        smoking_factor = 20000 if features['smoker'] == 'yes' else 0
        
        # Children factor
        children_factor = features['children'] * 700
        
        # Region factor
        region_factors = {
            'northeast': 1.15,
            'northwest': 1.0,
            'southeast': 1.08,
            'southwest': 0.92
        }
        region_multiplier = region_factors.get(features['region'], 1.0)
        
        total_cost = (base_cost + age_factor + bmi_factor + smoking_factor + children_factor) * region_multiplier
        
        # Determine risk category
        if total_cost > 25000:
            risk_category = "Very High Risk"
            confidence = 0.75
        elif total_cost > 15000:
            risk_category = "High Risk"
            confidence = 0.80
        elif total_cost > 8000:
            risk_category = "Medium Risk"
            confidence = 0.85
        else:
            risk_category = "Low Risk"
            confidence = 0.90
        
        factors = {
            "base_cost": base_cost,
            "age_impact": round(age_factor, 2),
            "bmi_impact": round(bmi_factor, 2),
            "smoking_impact": round(smoking_factor, 2),
            "children_impact": round(children_factor, 2),
            "region_multiplier": round(region_multiplier, 2)
        }
        
        return {
            "predicted_cost": round(total_cost, 2),
            "risk_category": risk_category,
            "confidence_score": confidence,
            "factors": factors
        }

# Global ML service instance
ml_service = MLModelService()