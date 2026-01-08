import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
const DB_PATH = process.env.DB_PATH || './data/trading.db';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error('Database connection error:', err);
    throw err;
  }
  logger.info('Connected to SQLite database');
});
export const dbRun = promisify(db.run.bind(db));
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));
export const initializeDatabase = async () => {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS instruments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        exchange TEXT NOT NULL,
        instrumentType TEXT NOT NULL,
        lastTradedPrice REAL NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        symbol TEXT NOT NULL,
        exchange TEXT NOT NULL,
        orderType TEXT NOT NULL CHECK(orderType IN ('BUY', 'SELL')),
        orderStyle TEXT NOT NULL CHECK(orderStyle IN ('MARKET', 'LIMIT')),
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        price REAL,
        status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'PLACED', 'PARTIALLY_EXECUTED', 'EXECUTED', 'CANCELLED')),
        executedPrice REAL,
        executedQuantity INTEGER DEFAULT 0,
        remainingQuantity INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        orderId TEXT NOT NULL,
        symbol TEXT NOT NULL,
        exchange TEXT NOT NULL,
        orderType TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        executedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (orderId) REFERENCES orders(id)
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS portfolio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        symbol TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        averagePrice REAL NOT NULL DEFAULT 0,
        currentValue REAL NOT NULL DEFAULT 0,
        averageBuyPrice REAL NOT NULL DEFAULT 0,
        realizedPnL REAL NOT NULL DEFAULT 0,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(userId, symbol)
      )
    `);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS wallet (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL UNIQUE,
        availableBalance REAL NOT NULL DEFAULT 1000000,
        totalInvested REAL NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbRun(`
      INSERT OR IGNORE INTO wallet (userId, availableBalance)
      VALUES ('MOCK_USER_001', 1000000)
    `);
    const existingInstruments: any = await dbAll('SELECT COUNT(*) as count FROM instruments');
    if (existingInstruments[0].count === 0) {
      const sampleInstruments = [
        { symbol: 'RELIANCE', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 2450.50 },
        { symbol: 'TCS', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 3450.75 },
        { symbol: 'INFY', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 1520.25 },
        { symbol: 'HDFCBANK', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 1680.00 },
        { symbol: 'ICICIBANK', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 980.50 },
        { symbol: 'SBIN', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 620.75 },
        { symbol: 'BHARTIARTL', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 1120.00 },
        { symbol: 'WIPRO', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 480.25 },
        { symbol: 'HINDUNILVR', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 2500.00 },
        { symbol: 'ITC', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 450.00 },
        { symbol: 'LT', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 3200.00 },
        { symbol: 'MARUTI', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 9800.00 },
        { symbol: 'ASIANPAINT', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 3200.00 },
        { symbol: 'NESTLEIND', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 24500.00 },
        { symbol: 'TITAN', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 3500.00 },
        { symbol: 'BAJFINANCE', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 7200.00 },
        { symbol: 'HDFC', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 2800.00 },
        { symbol: 'KOTAKBANK', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 1800.00 },
        { symbol: 'AXISBANK', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 1100.00 },
        { symbol: 'ONGC', exchange: 'BSE', instrumentType: 'EQUITY', lastTradedPrice: 250.00 },
      ];
      for (const instrument of sampleInstruments) {
        await dbRun(
          'INSERT INTO instruments (symbol, exchange, instrumentType, lastTradedPrice) VALUES (?, ?, ?, ?)',
          [instrument.symbol, instrument.exchange, instrument.instrumentType, instrument.lastTradedPrice]
        );
      }
      logger.info('Sample instruments inserted');
    }
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};