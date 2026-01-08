# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Setup (One-time)

### Option 1: Automated Setup

```bash
./setup.sh
```

### Option 2: Manual Setup

```bash
# Install backend dependencies
cd backend
npm install
cp .env.example .env  # Edit .env with your credentials
mkdir -p logs data
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend runs on: http://localhost:3001
API Docs: http://localhost:3001/api-docs

### Start Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

Frontend runs on: http://localhost:3000

## First Steps

1. Open http://localhost:3000 in your browser
2. Navigate to "Instruments" to see available stocks
3. Go to "Orders" and place a test order
4. Check "Trades" to see executed trades
5. View "Portfolio" to see your holdings

## Testing APIs

### Using Swagger UI

Visit http://localhost:3001/api-docs for interactive API testing.

### Using cURL

```bash
# Get instruments
curl http://localhost:3001/api/v1/instruments

# Place order
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

- **Port already in use**: Change PORT in backend/.env
- **Database errors**: Delete backend/data/trading.db and restart
- **Module errors**: Run `npm install` in the respective directory

