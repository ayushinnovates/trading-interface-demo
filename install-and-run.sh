#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Bajaj Broking Trading Platform Setup        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check Node.js
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo ""
    echo -e "${YELLOW}Please install Node.js first:${NC}"
    echo -e "  1. Visit: ${BLUE}https://nodejs.org/${NC}"
    echo -e "  2. Download the LTS version"
    echo -e "  3. Run the installer"
    echo -e "  4. Restart your terminal"
    echo ""
    echo -e "${YELLOW}Or use Homebrew:${NC}"
    echo -e "  ${BLUE}brew install node${NC}"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
echo ""

# Create directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p backend/logs backend/data frontend/dist
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Backend installation failed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi
cd ..

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Frontend installation failed!${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi
cd ..

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Setup Complete! Starting servers...      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Start backend
echo -e "${YELLOW}🔧 Starting backend server...${NC}"
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 4

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend server...${NC}"
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a bit more
sleep 3

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🚀 Servers are running!                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "${BLUE}📍 Backend:   ${GREEN}http://localhost:3001${NC}"
echo -e "${BLUE}📍 API Docs:  ${GREEN}http://localhost:3001/api-docs${NC}"
echo ""
echo -e "${YELLOW}📋 Server PIDs:${NC}"
echo -e "   Backend:  $BACKEND_PID"
echo -e "   Frontend: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend:  tail -f backend.log"
echo -e "   Frontend: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup INT TERM

# Keep script running
wait

