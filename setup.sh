#!/bin/bash

echo "🚀 Setting up Bajaj Broking Trading Platform..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/logs backend/data frontend/dist

# Setup backend
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
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
npm install
cd ..

# Setup frontend
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on http://localhost:3001"
echo "Frontend will run on http://localhost:3000"
echo "API Docs: http://localhost:3001/api-docs"

