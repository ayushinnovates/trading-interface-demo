# Where Live API is Used - Visual Guide

## 🎯 Quick Answer

The live API (Yahoo Finance) is used in **2 main features**:

1. **Instruments Page** - Shows real-time stock prices
2. **Order Execution** - MARKET orders execute at real-time prices

---

## 📍 Feature 1: Instruments Page

### **What Happens**:
```
User opens Instruments page
    ↓
Frontend calls: GET /api/v1/instruments
    ↓
Backend gets 20 stocks from database
    ↓
For EACH stock, backend calls Yahoo Finance API:
    - RELIANCE → https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS
    - TCS → https://query1.finance.yahoo.com/v8/finance/chart/TCS.NS
    - INFY → https://query1.finance.yahoo.com/v8/finance/chart/INFY.NS
    ... (20 API calls total)
    ↓
Gets REAL prices:
    - RELIANCE: ₹1,470.60 (LIVE from market)
    - TCS: ₹3,203.90 (LIVE from market)
    - Volume: 16,515,304 shares (REAL trading volume)
    ↓
Updates database with latest prices
    ↓
Returns to frontend with real data
    ↓
You see: Real prices, volume, high/low
```

### **Code**: `backend/src/routes/instruments.ts` (line 57)
```typescript
const marketData = await marketDataService.getQuote(instrument.symbol, instrument.exchange);
```

### **What You See**:
- ✅ Real prices (compare with Google Finance - they match!)
- ✅ Volume column (actual trading volume)
- ✅ High/Low prices (real day's range)

---

## 📍 Feature 2: Order Execution (MARKET Orders)

### **What Happens**:
```
User places MARKET order: BUY 10 RELIANCE
    ↓
Backend receives order
    ↓
Backend calls Yahoo Finance API RIGHT NOW:
    marketDataService.getCurrentPrice('RELIANCE', 'NSE')
    ↓
Gets LIVE price: ₹1,470.60 (current market price)
    ↓
Order executes at ₹1,470.60 (NOT cached price)
    ↓
Trade recorded: 10 shares × ₹1,470.60 = ₹14,706.00
    ↓
Portfolio updated with real price
```

### **Code**: `backend/src/routes/orders.ts` (line 101)
```typescript
const realTimePrice = await marketDataService.getCurrentPrice(symbol, exchange);
```

### **What You See**:
- ✅ Order executes at current market price
- ✅ Trade shows real execution price
- ✅ Portfolio uses real prices

---

## 🔍 How to Verify It's Working

### **Test 1: Check Instruments API**
```bash
curl http://localhost:3002/api/v1/instruments
```

**You'll see**:
```json
{
  "status": "success",
  "data": [
    {
      "symbol": "RELIANCE",
      "lastTradedPrice": 1470.6,  ← REAL price from Yahoo Finance
      "volume": 16515304,         ← REAL trading volume
      "high": 1503.9,             ← REAL day's high
      "low": 1468.8               ← REAL day's low
    }
  ],
  "source": "market_data_service"  ← Confirms using live API
}
```

### **Test 2: Place a MARKET Order**
1. Go to Orders page
2. Place order: BUY 10 RELIANCE (MARKET)
3. Check executed price - it's the REAL current price
4. Check backend logs - you'll see: "Fetched real-time price for RELIANCE: 1470.6"

### **Test 3: Compare Prices**
- Open Google Finance: Search "RELIANCE NSE"
- Compare price with your app
- **They should match!** (or very close)

---

## 📊 Current Status

### ✅ **Working**:
- Real prices being fetched (verified - just tested)
- Volume data showing
- High/Low prices available
- MARKET orders using real prices

### ⚠️ **Needs Fix**:
- Change % calculation (showing null for some)
- Will fix this now

---

## 🎯 Summary

**Live API is actively used in**:
1. ✅ **Instruments listing** - Every time you view instruments
2. ✅ **Order execution** - Every MARKET order placed

**You ARE seeing real market data!** The prices you see are LIVE from Yahoo Finance API, not hardcoded values.

The app fetches real prices from the market and uses them for:
- Displaying current stock prices
- Executing orders at real-time prices
- Updating your portfolio with real values

