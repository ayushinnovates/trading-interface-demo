import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { dbAll } from '../database/init';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { param } from 'express-validator';
const router = Router();
router.get('/:symbol', authenticate, param('symbol').notEmpty(), async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const userId = (req as any).userId;
    const buyOrders = await dbAll(
      `SELECT id, orderType, quantity, price, executedQuantity, remainingQuantity, status, createdAt
       FROM orders
       WHERE symbol = ? AND orderType = 'BUY' AND orderStyle = 'LIMIT'
       AND status IN ('NEW', 'PLACED', 'PARTIALLY_EXECUTED')
       ORDER BY price DESC, createdAt ASC
       LIMIT 5`,
      [symbol]
    );
    const sellOrders = await dbAll(
      `SELECT id, orderType, quantity, price, executedQuantity, remainingQuantity, status, createdAt
       FROM orders
       WHERE symbol = ? AND orderType = 'SELL' AND orderStyle = 'LIMIT'
       AND status IN ('NEW', 'PLACED', 'PARTIALLY_EXECUTED')
       ORDER BY price ASC, createdAt ASC
       LIMIT 5`,
      [symbol]
    );
    res.json({
      status: 'success',
      data: {
        symbol,
        buyOrders: buyOrders.map((order: any) => ({
          orderId: order.id,
          price: order.price,
          quantity: order.remainingQuantity || order.quantity,
          executedQuantity: order.executedQuantity || 0,
          status: order.status,
        })),
        sellOrders: sellOrders.map((order: any) => ({
          orderId: order.id,
          price: order.price,
          quantity: order.remainingQuantity || order.quantity,
          executedQuantity: order.executedQuantity || 0,
          status: order.status,
        })),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching order book:', error);
    throw new CustomError('Failed to fetch order book', 500);
  }
});
export default router;