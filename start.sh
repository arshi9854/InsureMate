#!/bin/bash

# HealthCost AI - Startup Script
# This script starts the full application stack

echo "🏥 Starting HealthCost AI Platform..."
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis

echo "📦 Building and starting services..."

# Start the application stack
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not responding"
fi

# Check frontend
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding (may still be starting up)"
fi

echo ""
echo "🎉 HealthCost AI is now running!"
echo "================================"
echo "🌐 Frontend:     http://localhost:3000"
echo "⚡ Backend API:  http://localhost:8000"
echo "📚 API Docs:     http://localhost:8000/docs"
echo "🗄️  Database:    localhost:5432"
echo "🔄 Redis Cache:  localhost:6379"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop:      docker-compose down"
echo ""
echo "Happy predicting! 🚀"