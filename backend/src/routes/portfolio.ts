import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { dbAll, dbGet } from '../database/init';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { bajajApiClient } from '../services/bajajApiClient';
import { marketDataService } from '../services/marketDataService';

const router = Router();

/**
 * @swagger
 * /api/v1/portfolio:
 *   get:
 *     summary: Fetch current portfolio holdings
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio holdings
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
 *                       quantity:
 *                         type: integer
 *                       averagePrice:
 *                         type: number
 *                       currentValue:
 *                         type: number
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Try to fetch from Bajaj API first
    let portfolio: any[] = [];

    try {
      portfolio = await bajajApiClient.getPortfolio();
      if (portfolio && portfolio.length > 0) {
        logger.info(`Fetched ${portfolio.length} portfolio items from Bajaj API`);
        return res.json({
          status: 'success',
          data: portfolio,
        });
      }
    } catch (error) {
      logger.warn('Bajaj API unavailable, using local data');
    }

    // Fall back to local database
    const localPortfolio: any[] = await dbAll(
      `SELECT symbol, quantity, averagePrice, currentValue, averageBuyPrice, realizedPnL
       FROM portfolio
       WHERE userId = ? AND quantity > 0
       ORDER BY symbol`,
      [userId]
    );

    // Calculate P&L for each holding
    const portfolioWithPnL = await Promise.all(
      localPortfolio.map(async (holding) => {
        // Get current market price
        let currentMarketPrice = holding.averagePrice;
        try {
          const instrument: any = await dbGet(
            'SELECT lastTradedPrice FROM instruments WHERE symbol = ? LIMIT 1',
            [holding.symbol]
          );
          if (instrument) {
            currentMarketPrice = instrument.lastTradedPrice;
          } else {
            // Try to fetch from market data service
            const marketData = await marketDataService.getQuote(holding.symbol, 'BSE');
            if (marketData) {
              currentMarketPrice = marketData.lastTradedPrice;
            }
          }
        } catch (error) {
          logger.warn(`Failed to fetch current price for ${holding.symbol}`);
        }

        // Calculate unrealized P&L
        const avgBuyPrice = holding.averageBuyPrice || holding.averagePrice;
        const unrealizedPnL = (currentMarketPrice - avgBuyPrice) * holding.quantity;
        const unrealizedPnLPercent = avgBuyPrice > 0 ? (unrealizedPnL / (avgBuyPrice * holding.quantity)) * 100 : 0;

        // Update current value
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

