import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { setupSwagger } from './config/swagger';
import instrumentRoutes from './routes/instruments';
import orderRoutes from './routes/orders';
import tradeRoutes from './routes/trades';
import portfolioRoutes from './routes/portfolio';
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallet';
import orderbookRoutes from './routes/orderbook';
import { initializeDatabase } from './database/init';
import { priceSimulator } from './services/priceSimulator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bajaj Broking API is running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/instruments', instrumentRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/trades', tradeRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/orderbook', orderbookRoutes);

// Swagger documentation
setupSwagger(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`🚀 Bajaj Broking API Server running on port ${PORT}`);
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      
      // Price simulator is DISABLED - we only use real market data from Yahoo Finance API
      // Prices are fetched from real market data, not simulated
      // When market is closed, shows last closing price and last traded volume
      // Price simulator disabled to ensure accurate, real-time prices only
    });
  })
  .catch((error) => {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  });

export default app;

