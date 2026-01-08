import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { dbAll, dbGet } from '../database/init';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { bajajApiClient } from '../services/bajajApiClient';
import { marketDataService } from '../services/marketDataService';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    let portfolio: any[] = [];
    try {
      portfolio = await bajajApiClient.getPortfolio();
      if (portfolio && Array.isArray(portfolio) && portfolio.length > 0 && typeof portfolio[0] === 'object' && !portfolio[0].includes) {
        logger.info(`Fetched ${portfolio.length} portfolio items from Bajaj API`);
        return res.json({
          status: 'success',
          data: portfolio,
        });
      }
    } catch (error) {
      logger.warn('Bajaj API unavailable, using local data');
    }
    const localPortfolio: any[] = await dbAll(
      `SELECT symbol, quantity, averagePrice, currentValue, averageBuyPrice, realizedPnL
       FROM portfolio
       WHERE userId = ? AND quantity > 0
       ORDER BY symbol`,
      [userId]
    );
    const portfolioWithPnL = await Promise.all(
      localPortfolio.map(async (holding) => {
        let currentMarketPrice = holding.averagePrice;
        try {
          const instrument: any = await dbGet(
            'SELECT lastTradedPrice FROM instruments WHERE symbol = ? LIMIT 1',
            [holding.symbol]
          );
          if (instrument) {
            currentMarketPrice = instrument.lastTradedPrice;
          } else {
            const marketData = await marketDataService.getQuote(holding.symbol, 'BSE');
            if (marketData) {
              currentMarketPrice = marketData.lastTradedPrice;
            }
          }
        } catch (error) {
          logger.warn(`Failed to fetch current price for ${holding.symbol}`);
        }
        const avgBuyPrice = holding.averageBuyPrice || holding.averagePrice;
        const unrealizedPnL = (currentMarketPrice - avgBuyPrice) * holding.quantity;
        const unrealizedPnLPercent = avgBuyPrice > 0 ? (unrealizedPnL / (avgBuyPrice * holding.quantity)) * 100 : 0;
        const currentValue = holding.quantity * currentMarketPrice;
        return {
          symbol: holding.symbol,
          quantity: holding.quantity,
          averagePrice: avgBuyPrice,
          currentMarketPrice: currentMarketPrice,
          currentValue: currentValue,
          realizedPnL: holding.realizedPnL || 0,
          unrealizedPnL: unrealizedPnL,
          unrealizedPnLPercent: unrealizedPnLPercent,
          totalPnL: (holding.realizedPnL || 0) + unrealizedPnL,
        };
      })
    );
    res.json({
      status: 'success',
      data: portfolioWithPnL,
    });
  } catch (error: any) {
    logger.error('Error fetching portfolio:', error);
    throw new CustomError('Failed to fetch portfolio', 500);
  }
});
export default router;