import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { dbAll, dbRun, dbGet } from '../database/init';
import { bajajApiClient } from '../services/bajajApiClient';
import { marketDataService } from '../services/marketDataService';
import { logger } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';
import { isMarketOpen, getMarketStatusMessage } from '../utils/marketHours';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const localInstruments: any[] = await dbAll(`
      SELECT symbol, exchange, instrumentType, lastTradedPrice
      FROM instruments
      ORDER BY symbol
    `);
    const instrumentsWithRealData = await Promise.all(
      localInstruments.map(async (instrument) => {
        try {
          const marketData = await marketDataService.getQuote(instrument.symbol, instrument.exchange);
          if (marketData && marketData.lastTradedPrice) {
            dbRun(
              'UPDATE instruments SET lastTradedPrice = ? WHERE symbol = ? AND exchange = ?',
              [marketData.lastTradedPrice, instrument.symbol, instrument.exchange]
            ).catch(() => {});
            return {
              ...instrument,
              lastTradedPrice: marketData.lastTradedPrice,
              change: marketData.change || 0,
              changePercent: marketData.changePercent || 0,
              volume: marketData.volume || 0,
              high: marketData.high,
              low: marketData.low,
              open: marketData.open,
            };
          }
          return instrument;
        } catch (error) {
          return instrument;
        }
      })
    );
    try {
      const bajajInstruments = await bajajApiClient.getInstruments();
      if (bajajInstruments && bajajInstruments.length > 0) {
        logger.info(`Fetched ${bajajInstruments.length} instruments from Bajaj API`);
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