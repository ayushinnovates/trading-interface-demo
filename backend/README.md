# Bajaj Broking Backend API

RESTful API wrapper SDK for Bajaj Broking Trading Platform.

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Create logs directory
mkdir -p logs

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Environment Variables

See `.env.example` for required environment variables.

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:3001/api-docs
- Health Check: http://localhost:3001/health

## Project Structure

```
src/
├── config/          # Configuration (Swagger)
├── database/        # Database initialization
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
└── utils/          # Utilities (logger)
```

