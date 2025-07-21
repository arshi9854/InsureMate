# Multi-stage Docker build for HealthCost AI

# Backend Stage
FROM python:3.9-slim as backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Create models directory
RUN mkdir -p models

# Expose backend port
EXPOSE 8000

# Command to run the backend
CMD ["uvicorn", "backend.app.main_simple:app", "--host", "0.0.0.0", "--port", "8000"]

# Frontend Stage
FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ .

# Build the frontend
RUN npm run build

# Production Stage
FROM nginx:alpine as production

# Copy built frontend to nginx
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]