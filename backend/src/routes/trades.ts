import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { dbAll } from '../database/init';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { symbol, side, fromDate, toDate } = req.query;
    let query = `SELECT id, orderId, symbol, exchange, orderType, quantity, price, executedAt
                 FROM trades
                 WHERE userId = ?`;
    const params: any[] = [userId];
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