#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Bajaj Broking Trading Platform...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p backend/logs backend/data

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cd backend
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        cat > .env << EOF
PORT=3001
NODE_ENV=development
BAJAJ_API_BASE_URL=https://apitrading.bajajbroking.in/api
BAJAJ_BRIDGELINK_URL=https://bridgelink.bajajbroking.in/api
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
REDIRECT_URL=http://localhost:3000/callback
DB_PATH=./data/trading.db
JWT_SECRET=bajaj_broking_secret_key_change_in_production
EOF
    fi
    cd ..
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${YELLOW}Starting servers...${NC}"
echo ""

# Start backend in background
echo -e "${GREEN}🔧 Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo -e "${GREEN}🎨 Starting frontend server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Servers started!${NC}"
echo ""
echo -e "${GREEN}📍 Backend:  http://localhost:3001${NC}"
echo -e "${GREEN}📍 Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}📍 API Docs: http://localhost:3001/api-docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Wait for user interrupt
trap "echo ''; echo -e '${YELLOW}Stopping servers...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Keep script running
wait

