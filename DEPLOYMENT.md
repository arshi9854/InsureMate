# 🚀 HealthCost AI - Production Deployment Guide

This guide covers deploying HealthCost AI to production environments including AWS, Google Cloud, and Azure.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Frontend      │────│   CDN           │
│   (ALB/CloudLB) │    │   (React App)   │    │   (CloudFront)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │────│   Backend API   │────│   Redis Cache   │
│   (Rate Limit)  │    │   (FastAPI)     │    │   (ElastiCache) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │────│   ML Models     │────│   Monitoring    │
│   (RDS/CloudSQL)│    │   (S3/GCS)      │    │   (CloudWatch)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌐 AWS Deployment

### Prerequisites
- AWS CLI configured
- Docker installed
- Terraform (optional, for infrastructure as code)

### 1. Container Registry Setup
```bash
# Create ECR repositories
aws ecr create-repository --repository-name healthcost-ai-backend
aws ecr create-repository --repository-name healthcost-ai-frontend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push images
docker build -t healthcost-ai-backend --target backend .
docker tag healthcost-ai-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/healthcost-ai-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/healthcost-ai-backend:latest

docker build -t healthcost-ai-frontend -f Dockerfile.frontend .
docker tag healthcost-ai-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/healthcost-ai-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/healthcost-ai-frontend:latest
```

### 2. Database Setup (RDS)
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier healthcost-ai-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username healthcost_user \
    --master-user-password <secure-password> \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --multi-az
```

### 3. Cache Setup (ElastiCache)
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id healthcost-ai-cache \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --security-group-ids sg-xxxxxxxxx
```

### 4. ECS Deployment
```yaml
# ecs-task-definition.json
{
  "family": "healthcost-ai",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/healthcost-ai-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://healthcost_user:<password>@<rds-endpoint>:5432/healthcost_ai"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://<elasticache-endpoint>:6379"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/healthcost-ai",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 5. Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name healthcost-ai-alb \
    --subnets subnet-xxxxxxxx subnet-yyyyyyyy \
    --security-groups sg-xxxxxxxxx

# Create target group
aws elbv2 create-target-group \
    --name healthcost-ai-targets \
    --protocol HTTP \
    --port 8000 \
    --vpc-id vpc-xxxxxxxxx \
    --target-type ip \
    --health-check-path /
```

## 🔵 Google Cloud Deployment

### 1. Container Registry
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and push
docker build -t gcr.io/<project-id>/healthcost-ai-backend --target backend .
docker push gcr.io/<project-id>/healthcost-ai-backend

docker build -t gcr.io/<project-id>/healthcost-ai-frontend -f Dockerfile.frontend .
docker push gcr.io/<project-id>/healthcost-ai-frontend
```

### 2. Cloud SQL Setup
```bash
# Create PostgreSQL instance
gcloud sql instances create healthcost-ai-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=us-central1

# Create database and user
gcloud sql databases create healthcost_ai --instance=healthcost-ai-db
gcloud sql users create healthcost_user --instance=healthcost-ai-db --password=<secure-password>
```

### 3. Cloud Run Deployment
```yaml
# cloudrun-backend.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: healthcost-ai-backend
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cloudsql-instances: <project-id>:us-central1:healthcost-ai-db
    spec:
      containers:
      - image: gcr.io/<project-id>/healthcost-ai-backend
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          value: postgresql://healthcost_user:<password>@/<database>?host=/cloudsql/<project-id>:us-central1:healthcost-ai-db
        resources:
          limits:
            cpu: 1000m
            memory: 512Mi
```

```bash
# Deploy to Cloud Run
gcloud run services replace cloudrun-backend.yaml --region=us-central1
```

## 🔷 Azure Deployment

### 1. Container Registry
```bash
# Create ACR
az acr create --resource-group healthcost-ai-rg --name healthcostai --sku Basic

# Build and push
az acr build --registry healthcostai --image healthcost-ai-backend --target backend .
az acr build --registry healthcostai --image healthcost-ai-frontend -f Dockerfile.frontend .
```

### 2. Database Setup
```bash
# Create PostgreSQL server
az postgres server create \
    --resource-group healthcost-ai-rg \
    --name healthcost-ai-db \
    --location eastus \
    --admin-user healthcost_user \
    --admin-password <secure-password> \
    --sku-name GP_Gen5_2
```

### 3. Container Instances
```bash
# Deploy backend
az container create \
    --resource-group healthcost-ai-rg \
    --name healthcost-ai-backend \
    --image healthcostai.azurecr.io/healthcost-ai-backend \
    --cpu 1 \
    --memory 1 \
    --registry-login-server healthcostai.azurecr.io \
    --registry-username healthcostai \
    --registry-password <acr-password> \
    --environment-variables DATABASE_URL=<connection-string> \
    --ports 8000
```

## 🔒 Security Configuration

### Environment Variables
```bash
# Production environment variables
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
JWT_SECRET_KEY=<strong-secret-key>
CORS_ORIGINS=https://healthcost-ai.com
LOG_LEVEL=INFO
ENVIRONMENT=production
```

### SSL/TLS Setup
```bash
# Let's Encrypt with Certbot
sudo certbot --nginx -d api.healthcost-ai.com
sudo certbot --nginx -d healthcost-ai.com
```

## 📊 Monitoring & Logging

### CloudWatch/Stackdriver Setup
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Health Checks
```python
# Add to main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "2.0.0",
        "database": "connected",
        "cache": "connected"
    }
```

## 🚀 CI/CD Pipeline

### GitHub Actions (Enhanced)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service --cluster healthcost-ai --service backend --force-new-deployment
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_predictions_user_created ON predictions(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_predictions_cost_range ON predictions(predicted_cost) WHERE predicted_cost > 20000;
```

### Caching Strategy
```python
# Redis caching configuration
CACHE_CONFIG = {
    "prediction_cache_ttl": 3600,  # 1 hour
    "analytics_cache_ttl": 1800,   # 30 minutes
    "health_metrics_cache_ttl": 300  # 5 minutes
}
```

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection Issues**
   - Check security groups/firewall rules
   - Verify connection strings
   - Test database connectivity

2. **Container Startup Issues**
   - Check logs: `docker logs <container-id>`
   - Verify environment variables
   - Check resource limits

3. **Performance Issues**
   - Monitor CPU/memory usage
   - Check database query performance
   - Verify cache hit rates

### Monitoring Commands
```bash
# Check container health
docker ps
docker logs healthcost-ai-backend

# Database monitoring
psql -h <host> -U healthcost_user -d healthcost_ai -c "SELECT * FROM pg_stat_activity;"

# Redis monitoring
redis-cli info stats
```

## 📞 Support

For deployment support:
- 📧 Email: devops@healthcost-ai.com
- 📚 Documentation: https://docs.healthcost-ai.com
- 🐛 Issues: https://github.com/your-username/healthcost-ai/issues