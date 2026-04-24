#!/bin/bash

# ============================================
# AI Project Manager - Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════╗"
echo "║       AI Project Manager                 ║"
echo "║       Starting Application...            ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Project root directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ============================================
# Step 1: Clean up used ports
# ============================================
echo -e "\n${YELLOW}▸ Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  Killing processes on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
  echo -e "  ${GREEN}✓ Port $port is free${NC}"
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ============================================
# Step 2: Check PostgreSQL
# ============================================
echo -e "\n${YELLOW}▸ Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ PostgreSQL is running${NC}"
  else
    echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    else
      sudo service postgresql start 2>/dev/null || true
    fi
    sleep 2
  fi
else
  echo -e "  ${YELLOW}⚠ pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# ============================================
# Step 3: Initialize Database
# ============================================
echo -e "\n${YELLOW}▸ Setting up database...${NC}"

# Create database if it doesn't exist
PGPASSWORD=${DB_PASSWORD:-postgres} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME:-ai_project_manager}'" | grep -q 1 || \
PGPASSWORD=${DB_PASSWORD:-postgres} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -c "CREATE DATABASE ${DB_NAME:-ai_project_manager}" 2>/dev/null
echo -e "  ${GREEN}✓ Database '${DB_NAME}' ready${NC}"

# Run init SQL
echo -e "  Running schema initialization..."
PGPASSWORD=${DB_PASSWORD:-postgres} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d ${DB_NAME:-ai_project_manager} -f "$PROJECT_DIR/backend/db/init.sql" > /dev/null 2>&1
echo -e "  ${GREEN}✓ Schema initialized${NC}"

# Run seed SQL
echo -e "  Seeding data..."
PGPASSWORD=${DB_PASSWORD:-postgres} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d ${DB_NAME:-ai_project_manager} -f "$PROJECT_DIR/backend/db/seed.sql" > /dev/null 2>&1
echo -e "  ${GREEN}✓ Data seeded successfully${NC}"

# ============================================
# Step 4: Install dependencies
# ============================================
echo -e "\n${YELLOW}▸ Installing dependencies...${NC}"

echo -e "  Installing backend dependencies..."
cd "$PROJECT_DIR/backend"
npm install --silent 2>/dev/null
echo -e "  ${GREEN}✓ Backend dependencies installed${NC}"

echo -e "  Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install --silent 2>/dev/null
echo -e "  ${GREEN}✓ Frontend dependencies installed${NC}"

cd "$PROJECT_DIR"

# ============================================
# Step 5: Start services with hot reload
# ============================================
echo -e "\n${CYAN}▸ Starting services with hot reload...${NC}"

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  kill $(jobs -p) 2>/dev/null
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend with nodemon (hot reload)
echo -e "  Starting backend on port ${BACKEND_PORT} (with nodemon hot reload)..."
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!

# Start frontend with Vite (hot reload built-in)
echo -e "  Starting frontend on port ${FRONTEND_PORT} (with Vite HMR)..."
cd "$PROJECT_DIR/frontend"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!

cd "$PROJECT_DIR"

sleep 3

echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════╗"
echo "║  AI Project Manager is running!          ║"
echo "║                                          ║"
echo "║  Frontend:  http://localhost:${FRONTEND_PORT}         ║"
echo "║  Backend:   http://localhost:${BACKEND_PORT}         ║"
echo "║                                          ║"
echo "║  Login: admin@aipm.com / password123     ║"
echo "║                                          ║"
echo "║  Hot reload enabled for both services    ║"
echo "║  Press Ctrl+C to stop all services       ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for background processes
wait
