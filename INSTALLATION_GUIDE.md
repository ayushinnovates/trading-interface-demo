# Installation and Running Guide

## Prerequisites

Before running the project, ensure you have Node.js installed.

### Installing Node.js

**Option 1: Using Homebrew (macOS)**
```bash
brew install node
```

**Option 2: Download from Official Website**
1. Visit https://nodejs.org/
2. Download the LTS version
3. Install the package

**Option 3: Using nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 18
nvm use 18
```

### Verify Installation

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

## Setup and Run Instructions

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env file with your Bajaj Broking API credentials (optional for testing)
```

### Step 3: Create Required Directories

```bash
mkdir -p backend/logs backend/data
```

### Step 4: Start Backend Server

**Terminal 1:**
```bash
cd backend
npm run dev
```

The backend will start on: **http://localhost:3001**
- API Documentation: http://localhost:3001/api-docs
- Health Check: http://localhost:3001/health

### Step 5: Start Frontend Server

**Terminal 2 (new terminal):**
```bash
cd frontend
npm run dev
```

The frontend will start on: **http://localhost:3000**

## Quick Test

1. Open your browser and go to: **http://localhost:3000**
2. You should see the Bajaj Broking Trading Platform dashboard
3. Navigate through:
   - **Dashboard**: Overview statistics
   - **Instruments**: View available stocks
   - **Orders**: Place new orders
   - **Trades**: View executed trades
   - **Portfolio**: View holdings and P&L

## Testing APIs

### Using Swagger UI
Visit: http://localhost:3001/api-docs

### Using cURL

**Get Instruments:**
```bash
curl http://localhost:3001/api/v1/instruments
```

**Place Order:**
```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "orderType": "BUY",
    "orderStyle": "MARKET",
    "quantity": 10
  }'
```

## Troubleshooting

### Port Already in Use
If port 3001 or 3000 is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts`

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Errors
```bash
# Delete database and restart (will recreate with sample data)
rm backend/data/trading.db
# Restart backend server
```

## Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

