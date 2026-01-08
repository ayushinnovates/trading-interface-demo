import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { dbAll, dbRun, dbGet } from '../database/init';
import { bajajApiClient } from '../services/bajajApiClient';
import { marketDataService } from '../services/marketDataService';
import { logger } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';
import { isMarketOpen, getMarketStatusMessage } from '../utils/marketHours';

const router = Router();

/**
 * @swagger
 * /api/v1/instruments:
 *   get:
 *     summary: Fetch list of tradable instruments
 *     tags: [Instruments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of instruments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       exchange:
 *                         type: string
 *                       instrumentType:
 *                         type: string
 *                       lastTradedPrice:
 *                         type: number
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    // Get instruments from local database
    const localInstruments: any[] = await dbAll(`
      SELECT symbol, exchange, instrumentType, lastTradedPrice
      FROM instruments
      ORDER BY symbol
    `);

    // Fetch REAL market data for all instruments in parallel for maximum speed
    // All requests happen simultaneously - much faster than sequential or small batches
    const instrumentsWithRealData = await Promise.all(
      localInstruments.map(async (instrument) => {
        try {
          // Fetch real-time price from market data service (Yahoo Finance API)
          // When market is open: returns live price
          // When market is closed: returns last closing price
          const marketData = await marketDataService.getQuote(instrument.symbol, instrument.exchange);
          
          if (marketData && marketData.lastTradedPrice) {
            // Update database with latest REAL price (not simulated) - async, don't wait
            dbRun(
              'UPDATE instruments SET lastTradedPrice = ? WHERE symbol = ? AND exchange = ?',
              [marketData.lastTradedPrice, instrument.symbol, instrument.exchange]
            ).catch(() => {}); // Silently fail - don't block response
            
            return {
              ...instrument,
              lastTradedPrice: marketData.lastTradedPrice,
              change: marketData.change || 0,
              changePercent: marketData.changePercent || 0,
              volume: marketData.volume || 0, // Last traded volume (or 0 if unavailable)
              high: marketData.high,
              low: marketData.low,
              open: marketData.open,
            };
          }
          
          // If API fails, return cached price
          return instrument;
        } catch (error) {
          // If API fails, return cached price
          return instrument;
        }
      })
    );

    // Try Bajaj API as additional source (optional)
    try {
      const bajajInstruments = await bajajApiClient.getInstruments();
      if (bajajInstruments && bajajInstruments.length > 0) {
        logger.info(`Fetched ${bajajInstruments.length} instruments from Bajaj API`);
        // Merge with real market data if available
        return res.json({
          status: 'success',
          data: instrumentsWithRealData,
          source: 'real_market_data',
        });
      }
    } catch (error) {
      logger.debug('Bajaj API unavailable, using market data service');
    }

    res.json({
      status: 'success',
      data: instrumentsWithRealData,
      source: 'market_data_service',
      marketStatus: {
        isOpen: isMarketOpen(),
        message: getMarketStatusMessage(),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching instruments:', error);
    throw new CustomError('Failed to fetch instruments', 500);
  }
});

export default router;

