*Campus Hiring Assignment – Bajaj Broking**

---

## 1. Overview

This repository is created as part of a campus hiring assignment that focuses on designing and implementing a **wrapper SDK around a simplified trading REST API system**.


The system simulates the **core workflows of an online stock trading platform** without requiring real market connectivity. All trading logic is simulated using in-memory or lightweight storage.

---

## 2. Objective of the Assignment

The primary objective is to design and build a **wrapper SDK** that interacts with a set of REST APIs representing a simplified trading backend.

The implementation should:

* Simulate essential trading operations
* Follow RESTful API design principles
* Be clean, modular, and easy to understand
* Focus on **design, structure, and simulation**, not production-level integrations

> **Note:** Integration with live Bajaj Broking APIs is **not mandatory**. This assignment is strictly for demonstrating design and implementation skills.

---

## 3. Problem Statement

Design and implement a wrapper SDK around REST APIs that allows users to perform the following actions:

1. View available financial instruments
2. Place buy and sell orders
3. Check order status
4. View executed trades
5. Fetch basic portfolio holdings

The system should represent a simplified trading backend using **in-memory or lightweight data storage**.

---

## 4. Functional Requirements

### 4.1 Instrument APIs

These APIs allow users to fetch tradable financial instruments.

**Features:**

* Fetch a list of available instruments

**Instrument Fields:**

* `symbol`
* `exchange`
* `instrumentType`
* `lastTradedPrice`

**API Endpoint Example:**

```
GET /api/v1/instruments
```

---

### 4.2 Order Management APIs

These APIs handle order placement and order status tracking.

#### 4.2.1 Place a New Order

**Order Types:**

* BUY
* SELL

**Order Styles:**

* MARKET
* LIMIT

**Mandatory Fields:**

* `quantity` (must be greater than 0)
* `price` (mandatory only for LIMIT orders)

**Validations:**

* Quantity must be greater than zero
* Price must be provided for LIMIT orders

**API Endpoint Example:**

```
POST /api/v1/orders
```

---

#### 4.2.2 Fetch Order Status

Supported order states:

* `NEW`
* `PLACED`
* `EXECUTED`
* `CANCELLED`

**API Endpoint Example:**

```
GET /api/v1/orders/{orderId}
```

---

### 4.3 Trade APIs

These APIs allow users to view executed trades.

**Features:**

* Fetch list of executed trades for a user

**API Endpoint Example:**

```
GET /api/v1/trades
```

---

### 4.4 Portfolio APIs

These APIs provide information about current portfolio holdings.

**Portfolio Fields:**

* `symbol`
* `quantity`
* `averagePrice`
* `currentValue`

**API Endpoint Example:**

```
GET /api/v1/portfolio
```

---

## 5. Non-Functional Requirements

The system must adhere to the following non-functional requirements:

* Follow RESTful API design principles
* Use clean code structure and meaningful naming conventions
* Implement proper error handling with appropriate HTTP status codes
* Use in-memory or lightweight storage (H2 / SQLite / Map-based storage)
* Authentication can be mocked (a single hardcoded user is sufficient)

---

## 6. Technology Stack (Preferred, Not Mandatory)

* **Backend:** Java (Spring Boot) / Node.js / Python
* **API Format:** JSON
* **Database:** In-memory or lightweight database
* **Optional:** Docker-based setup

---

## 7. Bonus (Optional – Extra Weightage)

The following enhancements are optional but provide additional evaluation weight:

* Basic logging and centralized exception handling
* Swagger / OpenAPI documentation
* Unit tests for critical APIs
* Simple order execution simulation logic
  (e.g., immediate execution for market orders)

---

## 8. Deliverables

Candidates are required to submit:

1. **Source Code**

   * GitHub repository link or ZIP file

2. **README File (Mandatory)**

   * Setup and run instructions
   * API details
   * Assumptions made during implementation

3. **Sample API Usage**

   * Sample request/response screenshots **or**
   * `curl` command examples

---

## 9. Evaluation Criteria

Submissions will be evaluated based on:

* Clarity and correctness of API design
* Code quality and project structure
* Understanding of basic trading concepts
* Error handling and edge case coverage
* Documentation completeness and clarity

---

## 10. Reference API Documentation

Candidates may refer to real-world trading API documentation for understanding domain concepts:

```
https://apitrading.bajajbroking.in/
```

> Integration with live APIs is **not required**.

---

## 11. Scope Clarification

This assignment is focused on:

* **Design**
* **Structure**
* **Simulation**

It is **not focused on production readiness** or real market integration.

---

## 12. Implementation Details

### 12.1 Architecture Overview

The project is structured as a full-stack application with:

- **Backend**: Node.js/Express with TypeScript
- **Frontend**: React with Material UI
- **Database**: SQLite (lightweight, file-based)
- **API Integration**: Bajaj Broking API client with fallback to local simulation

### 12.2 Project Structure

```
bajaj-broking/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (Swagger)
│   │   ├── database/        # Database initialization and queries
│   │   ├── middleware/      # Express middleware (auth, error handling)
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic and external API clients
│   │   └── utils/           # Utility functions (logger)
│   ├── data/                # SQLite database files
│   ├── logs/                # Application logs
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.tsx          # Main app component
│   └── package.json
└── readme.md
```

### 12.3 Technology Stack

**Backend:**
- Node.js 18+
- Express.js
- TypeScript
- SQLite3
- Winston (Logging)
- Swagger (API Documentation)
- Axios (HTTP Client)

**Frontend:**
- React 18
- TypeScript
- Material UI (MUI)
- React Router
- Axios
- Vite (Build Tool)

---

## 13. Setup and Run Instructions

### 13.1 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### 13.2 Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (edit `.env`):
   ```env
   PORT=3001
   NODE_ENV=development
   BAJAJ_API_BASE_URL=https://apitrading.bajajbroking.in/api
   BAJAJ_BRIDGELINK_URL=https://bridgelink.bajajbroking.in/api
   CLIENT_ID=your_client_id_here
   CLIENT_SECRET=your_client_secret_here
   REDIRECT_URL=http://localhost:3000/callback
   DB_PATH=./data/trading.db
   JWT_SECRET=bajaj_broking_secret_key
   ```

5. **Create logs directory:**
   ```bash
   mkdir -p logs
   ```

6. **Run the backend:**
   ```bash
   npm run dev
   ```

   The backend will start on `http://localhost:3001`
   - API Documentation: `http://localhost:3001/api-docs`
   - Health Check: `http://localhost:3001/health`

### 13.3 Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the frontend:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

### 13.4 Running Both Services

**Option 1: Separate Terminals**
- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm run dev`

**Option 2: Build and Run Production**
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## 14. API Documentation

### 14.1 Base URL

```
http://localhost:3001/api/v1
```

### 14.2 Authentication

For development, authentication is mocked. Include the following header in requests:

```
Authorization: Bearer mock_token
```

Or omit the header (development mode allows unauthenticated requests).

### 14.3 API Endpoints

#### 14.3.1 Instruments API

**GET /api/v1/instruments**

Fetch list of tradable instruments.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "symbol": "RELIANCE",
      "exchange": "NSE",
      "instrumentType": "EQUITY",
      "lastTradedPrice": 2450.50
    }
  ]
}
```

#### 14.3.2 Orders API

**POST /api/v1/orders**

Place a new order.

**Request Body:**
```json
{
  "symbol": "RELIANCE",
  "exchange": "NSE",
  "orderType": "BUY",
  "orderStyle": "MARKET",
  "quantity": 10,
  "price": 2450.50  // Required only for LIMIT orders
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order placed successfully",
  "data": {
    "id": "uuid-here",
    "userId": "MOCK_USER_001",
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "orderType": "BUY",
    "orderStyle": "MARKET",
    "quantity": 10,
    "price": 2450.50,
    "status": "EXECUTED",
    "executedPrice": 2450.50,
    "executedQuantity": 10,
    "createdAt": "2024-01-08T12:00:00.000Z",
    "updatedAt": "2024-01-08T12:00:00.000Z"
  }
}
```

**GET /api/v1/orders**

Get all orders for the authenticated user.

**GET /api/v1/orders/{orderId}**

Get specific order details.

#### 14.3.3 Trades API

**GET /api/v1/trades**

Fetch list of executed trades.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "trade-uuid",
      "orderId": "order-uuid",
      "symbol": "RELIANCE",
      "exchange": "NSE",
      "orderType": "BUY",
      "quantity": 10,
      "price": 2450.50,
      "executedAt": "2024-01-08T12:00:00.000Z"
    }
  ]
}
```

#### 14.3.4 Portfolio API

**GET /api/v1/portfolio**

Fetch current portfolio holdings.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "symbol": "RELIANCE",
      "quantity": 10,
      "averagePrice": 2450.50,
      "currentValue": 24505.00
    }
  ]
}
```

#### 14.3.5 Authentication API

**GET /api/v1/auth/authorize**

Get authorization URL for Bajaj Broking login.

**POST /api/v1/auth/token**

Exchange authorization code for access token.

**GET /api/v1/auth/profile**

Get user profile (requires authentication).

---

## 15. Sample API Usage (cURL Examples)

### 15.1 Get Instruments

```bash
curl -X GET http://localhost:3001/api/v1/instruments \
  -H "Authorization: Bearer mock_token" \
  -H "Content-Type: application/json"
```

### 15.2 Place Market Order

```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer mock_token" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "exchange": "NSE",
    "orderType": "BUY",
    "orderStyle": "MARKET",
    "quantity": 10
  }'
```

### 15.3 Place Limit Order

```bash
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer mock_token" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TCS",
    "exchange": "NSE",
    "orderType": "BUY",
    "orderStyle": "LIMIT",
    "quantity": 5,
    "price": 3400.00
  }'
```

### 15.4 Get Order Status

```bash
curl -X GET http://localhost:3001/api/v1/orders/{orderId} \
  -H "Authorization: Bearer mock_token" \
  -H "Content-Type: application/json"
```

### 15.5 Get Trades

```bash
curl -X GET http://localhost:3001/api/v1/trades \
  -H "Authorization: Bearer mock_token" \
  -H "Content-Type: application/json"
```

### 15.6 Get Portfolio

```bash
curl -X GET http://localhost:3001/api/v1/portfolio \
  -H "Authorization: Bearer mock_token" \
  -H "Content-Type: application/json"
```

---

## 16. Assumptions and Design Decisions

### 16.1 Assumptions

1. **Authentication**: Mock authentication is used for development. In production, this would integrate with Bajaj Broking's OAuth flow.

2. **Order Execution**:
   - MARKET orders are executed immediately at the last traded price
   - LIMIT orders are placed and remain in "PLACED" status until price matches (simulated)

3. **Portfolio Calculation**:
   - Average price is calculated using weighted average
   - Current value is calculated using latest instrument prices
   - P&L is calculated as (currentValue - investedAmount)

4. **Data Storage**: SQLite is used for persistence. The database file is created automatically on first run.

5. **Bajaj API Integration**: 
   - The system attempts to fetch data from Bajaj Broking APIs when available
   - Falls back to local database if API is unavailable
   - This allows the system to work both with and without live API connectivity

### 16.2 Design Decisions

1. **RESTful API Design**: All endpoints follow REST conventions with appropriate HTTP methods and status codes.

2. **Error Handling**: Centralized error handling middleware provides consistent error responses.

3. **Logging**: Winston logger is used for structured logging with different log levels.

4. **Type Safety**: TypeScript is used throughout for type safety and better developer experience.

5. **Modular Architecture**: Code is organized into clear modules (routes, services, middleware) for maintainability.

6. **API Documentation**: Swagger/OpenAPI documentation is automatically generated from code annotations.

7. **Frontend State Management**: React hooks are used for state management. For larger applications, consider Redux or Zustand.

8. **UI Framework**: Material UI is used for consistent, professional UI components aligned with Bajaj Broking branding.

---

## 17. Features Implemented

### 17.1 Core Features ✅

- [x] Instrument APIs (fetch tradable instruments)
- [x] Order Management APIs (place orders, check status)
- [x] Trade APIs (view executed trades)
- [x] Portfolio APIs (view holdings)
- [x] RESTful API design
- [x] Error handling with appropriate HTTP status codes
- [x] SQLite database for data persistence
- [x] Mock authentication

### 17.2 Bonus Features ✅

- [x] Centralized logging (Winston)
- [x] Centralized exception handling
- [x] Swagger/OpenAPI documentation
- [x] Order execution simulation (immediate execution for market orders)
- [x] Bajaj Broking API integration (with fallback)
- [x] Complete frontend with Material UI
- [x] Responsive design

### 17.3 Frontend Features ✅

- [x] Dashboard with statistics
- [x] Instruments listing
- [x] Order placement interface
- [x] Order history
- [x] Trade history
- [x] Portfolio view with P&L
- [x] Responsive navigation
- [x] Bajaj Broking branding

---

## 18. Testing

### 18.1 Manual Testing

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Test each feature through the UI:
   - View instruments
   - Place orders (both MARKET and LIMIT)
   - View order status
   - View trades
   - View portfolio

### 18.2 API Testing

Use the Swagger UI at `http://localhost:3001/api-docs` to test all API endpoints interactively.

### 18.3 cURL Testing

Use the cURL examples in Section 15 to test APIs from command line.

---

## 19. Troubleshooting

### 19.1 Backend Issues

**Port already in use:**
- Change `PORT` in `.env` file

**Database errors:**
- Ensure `data/` directory exists and is writable
- Delete `data/trading.db` to reset database

**Module not found:**
- Run `npm install` in backend directory

### 19.2 Frontend Issues

**Cannot connect to backend:**
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in frontend environment (if set)

**Build errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 20. Future Enhancements

Potential improvements for production:

1. **Authentication**: Full OAuth 2.0 integration with Bajaj Broking
2. **Real-time Updates**: WebSocket integration for live market data
3. **Order Management**: Cancel order functionality
4. **Advanced Portfolio**: Historical performance, charts
5. **Testing**: Unit tests, integration tests
6. **Docker**: Containerization for easy deployment
7. **CI/CD**: Automated testing and deployment
8. **Monitoring**: Application performance monitoring
9. **Rate Limiting**: API rate limiting
10. **Caching**: Redis for caching frequently accessed data

---

## 21. Contact and Support

For questions or issues related to this assignment:

- API Documentation: `http://localhost:3001/api-docs`
- Bajaj Broking API Reference: https://apitrading.bajajbroking.in/

---

**Note**: This implementation is designed for the campus hiring assignment and focuses on demonstrating design, structure, and simulation capabilities rather than production-ready features.

---
