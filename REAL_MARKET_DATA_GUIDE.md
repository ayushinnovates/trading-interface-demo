# Real Market Data Integration Guide

## ✅ What's Changed

### 1. **Real Market Data Enabled by Default**
- ✅ Yahoo Finance API integration (no API key required)
- ✅ Fetches live stock prices for Indian stocks (NSE/BSE)
- ✅ Automatic price updates every time you view instruments

### 2. **More Instruments Added**
- ✅ Increased from 8 to **20 popular Indian stocks**
- ✅ Includes: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, SBIN, BHARTIARTL, WIPRO, HINDUNILVR, ITC, LT, MARUTI, ASIANPAINT, NESTLEIND, TITAN, BAJFINANCE, HDFC, KOTAKBANK, AXISBANK, ONGC

### 3. **Visual Improvements**
- ✅ **Real-time price indicators** - Shows green/red arrows for price changes
- ✅ **Change percentage** - Displays % change with color coding
- ✅ **Volume data** - Shows trading volume when available
- ✅ **Refresh button** - Manual refresh to get latest prices
- ✅ **Auto-refresh** - Updates every 30 seconds
- ✅ **Status indicator** - Shows when real market data is active

### 4. **Order Execution with Real Prices**
- ✅ MARKET orders now execute at **real-time live prices**
- ✅ Prices fetched from Yahoo Finance API
- ✅ Automatic price updates in database

---

## 🚀 How to See Real Market Data

### Step 1: Restart Backend Server
The backend has been restarted with:
- Real market data enabled by default
- 20 instruments in database
- Yahoo Finance API integration

### Step 2: View Instruments Page
1. Go to **Instruments** page in the frontend
2. You should see:
   - **20 stocks** instead of 8
   - **Real-time prices** (updated from live market)
   - **Change %** column with green/red indicators
   - **Volume** column
   - **"Real-time market data enabled"** alert at top

### Step 3: Refresh Prices
- Click the **refresh icon** (🔄) to get latest prices
- Prices auto-refresh every 30 seconds
- Last update time shown in header

### Step 4: Place Orders
- When placing a **MARKET order**, it will execute at the **real-time price** shown
- Prices are fetched live from Yahoo Finance API

---

## 📊 What You'll See

### Instruments Table Now Shows:
1. **Symbol** - Stock symbol
2. **Exchange** - NSE/BSE
3. **Type** - EQUITY
4. **Last Traded Price** - **Real-time price from market**
5. **Change** - **% change with up/down arrows** (green/red)
6. **Volume** - Trading volume

### Visual Indicators:
- 🟢 **Green arrow + positive %** = Price went up
- 🔴 **Red arrow + negative %** = Price went down
- **"Real-time market data enabled"** banner = Live data is active

---

## 🔧 Technical Details

### APIs Used:
1. **Yahoo Finance** (Primary) - No API key needed
   - Format: `SYMBOL.NS` for NSE (e.g., RELIANCE.NS)
   - Format: `SYMBOL.BO` for BSE (e.g., RELIANCE.BO)
   - Provides: Price, change, volume, high, low, open

2. **Alpha Vantage** (Optional) - Requires free API key
   - Get key: https://www.alphavantage.co/support/#api-key
   - Add to `.env`: `ALPHA_VANTAGE_API_KEY=your_key`
   - Rate limit: 5 calls/minute

### Configuration:
Real market data is **enabled by default**. To disable:
```env
USE_REAL_MARKET_DATA=false
```

---

## 🎯 Expected Behavior

### When You Open Instruments Page:
1. ✅ See 20 stocks (not 8)
2. ✅ See real-time prices (not hardcoded)
3. ✅ See change % with color indicators
4. ✅ See volume data
5. ✅ See "Real-time market data enabled" message

### When You Place a MARKET Order:
1. ✅ System fetches real-time price
2. ✅ Order executes at live market price
3. ✅ Price updates in database
4. ✅ Trade recorded with real price

---

## 🐛 Troubleshooting

### If you still see old data:
1. **Restart backend server** - Database was reset
2. **Clear browser cache** - Refresh the page
3. **Check backend logs** - Should show "Fetched real-time price for..."

### If prices show as "-":
- Yahoo Finance API might be temporarily unavailable
- System falls back to cached prices
- Try refreshing after a few seconds

### If you see only 8 instruments:
- Database might not have reset
- Delete `backend/data/trading.db` and restart server

---

## 📝 Summary

**What Changed:**
- ✅ Real market data enabled (Yahoo Finance - no API key)
- ✅ 20 instruments instead of 8
- ✅ Visual indicators for price changes
- ✅ Auto-refresh every 30 seconds
- ✅ Real-time order execution

**How to See It:**
1. Restart backend (already done)
2. Go to Instruments page
3. See 20 stocks with real prices
4. See green/red change indicators
5. Click refresh to update prices

**The app now shows REAL market data, not hardcoded values!** 🎉

