import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { dbAll } from '../database/init';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/trades:
 *   get:
 *     summary: Fetch list of executed trades
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of executed trades
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
 *                       id:
 *                         type: string
 *                       orderId:
 *                         type: string
 *                       symbol:
 *                         type: string
 *                       exchange:
 *                         type: string
 *                       orderType:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                       executedAt:
 *                         type: string
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { symbol, side, fromDate, toDate } = req.query;

    let query = `SELECT id, orderId, symbol, exchange, orderType, quantity, price, executedAt
                 FROM trades
                 WHERE userId = ?`;
    const params: any[] = [userId];

    // Apply filters
    if (symbol) {
      query += ' AND symbol = ?';
      params.push(symbol);
    }

    if (side && (side === 'BUY' || side === 'SELL')) {
      query += ' AND orderType = ?';
      params.push(side);
    }

    if (fromDate) {
      query += ' AND executedAt >= ?';
      params.push(fromDate);
    }

    if (toDate) {
      query += ' AND executedAt <= ?';
      params.push(toDate);
    }

    query += ' ORDER BY executedAt DESC';

    const trades = await dbAll(query, params);

    res.json({
      status: 'success',
      data: trades,
      filters: {
        symbol: symbol || null,
        side: side || null,
        fromDate: fromDate || null,
        toDate: toDate || null,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching trades:', error);
    throw new CustomError('Failed to fetch trades', 500);
  }
});

export default router;

