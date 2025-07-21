-- HealthCost AI Database Initialization Script
-- This script sets up the production database with sample data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS healthcost_ai;

-- Use the database
\c healthcost_ai;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sample users for demonstration
INSERT INTO users (email, username, hashed_password, is_active, is_premium, created_at) 
VALUES 
    ('demo@healthcost.ai', 'demo_user', '$2b$12$sample_hashed_password', true, false, NOW()),
    ('admin@healthcost.ai', 'admin_user', '$2b$12$sample_hashed_password', true, true, NOW()),
    ('test@healthcost.ai', 'test_user', '$2b$12$sample_hashed_password', true, false, NOW())
ON CONFLICT (email) DO NOTHING;

-- Sample predictions for analytics
INSERT INTO predictions (
    user_id, age, sex, bmi, children, smoker, region, 
    predicted_cost, risk_category, confidence_score, 
    model_version, prediction_time_ms, created_at
) VALUES 
    (1, 25, 'male', 22.5, 0, 'no', 'northeast', 8450.50, 'Low Risk', 0.92, '1.0.0', 45.2, NOW() - INTERVAL '1 day'),
    (1, 45, 'female', 28.3, 2, 'no', 'southeast', 12750.75, 'Medium Risk', 0.88, '1.0.0', 52.1, NOW() - INTERVAL '2 days'),
    (1, 35, 'male', 32.1, 1, 'yes', 'northwest', 35200.25, 'Very High Risk', 0.85, '1.0.0', 48.7, NOW() - INTERVAL '3 days'),
    (2, 28, 'female', 24.8, 0, 'no', 'southwest', 9200.00, 'Low Risk', 0.91, '1.0.0', 43.5, NOW() - INTERVAL '4 days'),
    (2, 52, 'male', 29.5, 3, 'yes', 'northeast', 42100.80, 'Very High Risk', 0.83, '1.0.0', 55.3, NOW() - INTERVAL '5 days'),
    (3, 31, 'female', 26.2, 1, 'no', 'southeast', 11500.40, 'Medium Risk', 0.89, '1.0.0', 47.8, NOW() - INTERVAL '6 days'),
    (1, 40, 'male', 35.7, 2, 'yes', 'southwest', 38750.60, 'High Risk', 0.86, '1.0.0', 51.2, NOW() - INTERVAL '7 days'),
    (2, 22, 'female', 21.3, 0, 'no', 'northwest', 7800.25, 'Low Risk', 0.94, '1.0.0', 41.9, NOW() - INTERVAL '8 days'),
    (3, 48, 'male', 27.9, 1, 'no', 'northeast', 15200.90, 'Medium Risk', 0.87, '1.0.0', 49.6, NOW() - INTERVAL '9 days'),
    (1, 33, 'female', 31.2, 0, 'yes', 'southeast', 32500.45, 'High Risk', 0.84, '1.0.0', 53.7, NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Sample model performance data
INSERT INTO model_performance (
    model_version, accuracy, precision, recall, f1_score, rmse, mae,
    training_date, dataset_size, feature_importance, created_at
) VALUES (
    '1.0.0', 0.862, 0.845, 0.878, 0.861, 4841.88, 2608.55,
    NOW() - INTERVAL '30 days', 1338, 
    '{"smoking": 0.45, "bmi": 0.25, "age": 0.15, "region": 0.10, "children": 0.05}',
    NOW()
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_category ON predictions(risk_category);
CREATE INDEX IF NOT EXISTS idx_predictions_smoker ON predictions(smoker);
CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON api_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_metrics_created_at ON api_metrics(created_at);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO healthcost_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO healthcost_user;