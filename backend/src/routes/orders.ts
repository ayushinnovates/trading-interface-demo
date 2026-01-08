import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { dbRun, dbGet, dbAll } from '../database/init';
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { bajajApiClient } from '../services/bajajApiClient';
import { marketDataService } from '../services/marketDataService';
import { walletService } from '../services/walletService';
const router = Router();
const validateOrder = [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('exchange').notEmpty().withMessage('Exchange is required'),
  body('orderType').isIn(['BUY', 'SELL']).withMessage('Order type must be BUY or SELL'),
  body('orderStyle').isIn(['MARKET', 'LIMIT']).withMessage('Order style must be MARKET or LIMIT'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be greater than 0'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];
router.post('/', authenticate, validateOrder, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    const { symbol, exchange, orderType, orderStyle, quantity, price } = req.body;
    const userId = (req as any).userId;
    if (orderStyle === 'LIMIT' && (!price || price <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Price is required for LIMIT orders',
      });
    }
    const instrument: any = await dbGet(
      'SELECT * FROM instruments WHERE symbol = ? AND exchange = ?',
      [symbol, exchange]
    );
    if (!instrument) {
      return res.status(404).json({
        status: 'error',
        message: 'Instrument not found',
      });
    }
    let executionPrice = price;
    if (orderStyle === 'MARKET') {
      try {
        const realTimePrice = await marketDataService.getCurrentPrice(symbol, exchange);
        if (realTimePrice) {
          executionPrice = realTimePrice;
          await dbRun(
            'UPDATE instruments SET lastTradedPrice = ? WHERE symbol = ? AND exchange = ?',
            [realTimePrice, symbol, exchange]
          );
          logger.info(`Fetched real-time price for ${symbol}: ${realTimePrice}`);
        } else {
          executionPrice = instrument.lastTradedPrice;
          logger.info(`Using cached price for ${symbol}: ${executionPrice}`);
        }
      } catch (error) {
        executionPrice = instrument.lastTradedPrice;
        logger.warn(`Failed to fetch real-time price, using cached: ${executionPrice}`);
      }
    }
    const orderId = uuidv4();
    const initialStatus = 'NEW';
    const orderPrice = executionPrice;
    if (orderType === 'BUY') {
      const totalCost = quantity * executionPrice;
      const hasBalance = await walletService.hasSufficientBalance(userId, totalCost);
      if (!hasBalance) {
        const balance = await walletService.getBalance(userId);
        return res.status(400).json({
          status: 'error',
          message: `Insufficient balance. Required: ₹${totalCost.toFixed(2)}, Available: ₹${balance.availableBalance.toFixed(2)}`,
        });
      }
    }
    await dbRun(
      `INSERT INTO orders (id, userId, symbol, exchange, orderType, orderStyle, quantity, price, status, remainingQuantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, userId, symbol, exchange, orderType, orderStyle, quantity, orderPrice || null, initialStatus, quantity]
    );
    let finalStatus = initialStatus;
    let executedPrice = null;
    let executedQuantity = 0;
    let remainingQuantity = quantity;
    if (orderStyle === 'MARKET') {
      finalStatus = 'EXECUTED';
      executedPrice = orderPrice;
      executedQuantity = quantity;
      remainingQuantity = 0;
      if (orderType === 'BUY') {
        await walletService.deductBalance(userId, quantity * executedPrice);
      }
      await dbRun(
        `UPDATE orders SET status = ?, executedPrice = ?, executedQuantity = ?, remainingQuantity = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [finalStatus, executedPrice, executedQuantity, remainingQuantity, orderId]
      );
      const tradeId = uuidv4();
      await dbRun(
        `INSERT INTO trades (id, userId, orderId, symbol, exchange, orderType, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tradeId, userId, orderId, symbol, exchange, orderType, quantity, executedPrice]
      );
      await updatePortfolio(userId, symbol, orderType, quantity, executedPrice);
      if (orderType === 'SELL') {
        await walletService.creditBalance(userId, quantity * executedPrice);
      }
    } else {
      const executionPercentage = 0.5 + Math.random() * 0.2;
      executedQuantity = Math.floor(quantity * executionPercentage);
      remainingQuantity = quantity - executedQuantity;
      executedPrice = price;
      if (executedQuantity > 0) {
        finalStatus = remainingQuantity > 0 ? 'PARTIALLY_EXECUTED' : 'EXECUTED';
        if (orderType === 'BUY') {
          await walletService.deductBalance(userId, executedQuantity * executedPrice);
        }
        await dbRun(
          `UPDATE orders SET status = ?, executedPrice = ?, executedQuantity = ?, remainingQuantity = ?, updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [finalStatus, executedPrice, executedQuantity, remainingQuantity, orderId]
        );
        const tradeId = uuidv4();
        await dbRun(
          `INSERT INTO trades (id, userId, orderId, symbol, exchange, orderType, quantity, price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [tradeId, userId, orderId, symbol, exchange, orderType, executedQuantity, executedPrice]
        );
        await updatePortfolio(userId, symbol, orderType, executedQuantity, executedPrice);
        if (orderType === 'SELL') {
          await walletService.creditBalance(userId, executedQuantity * executedPrice);
        }
        logger.info(`LIMIT order ${orderId} partially executed: ${executedQuantity}/${quantity} shares`);
      } else {
        finalStatus = 'PLACED';
        await dbRun(
          `UPDATE orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          [finalStatus, orderId]
        );
      }
    }
    try {
      await bajajApiClient.placeOrder({
        symbol,
        exchange,
        orderType,
        orderStyle,
        quantity,
        price: orderPrice,
      });
    } catch (error) {
      logger.warn('Bajaj API order placement failed, using local simulation');
    }
    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error: any) {
    logger.error('Error placing order:', error);
    throw new CustomError('Failed to place order', 500);
  }
});
router.get('/:orderId', authenticate, param('orderId').notEmpty(), async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).userId;
    const order = await dbGet(
      'SELECT * FROM orders WHERE id = ? AND userId = ?',
      [orderId, userId]
    );
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }
    res.json({
      status: 'success',
      data: order,
    });
  } catch (error: any) {
    logger.error('Error fetching order:', error);
    throw new CustomError('Failed to fetch order', 500);
  }
});
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const orders = await dbAll(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    res.json({
      status: 'success',
      data: orders,
    });
  } catch (error: any) {
    logger.error('Error fetching orders:', error);
    throw new CustomError('Failed to fetch orders', 500);
  }
});
async function updatePortfolio(
  userId: string,
  symbol: string,
  orderType: string,
  quantity: number,
  price: number
) {
  try {
    const existing = await dbGet(
      'SELECT * FROM portfolio WHERE userId = ? AND symbol = ?',
      [userId, symbol]
    );
    if (existing) {
      let newQuantity = existing.quantity;
      let newAveragePrice = existing.averagePrice;
      let newCurrentValue = existing.currentValue;
      if (orderType === 'BUY') {
        const totalCost = existing.averagePrice * existing.quantity + price * quantity;
        newQuantity = existing.quantity + quantity;
        newAveragePrice = totalCost / newQuantity;
        newCurrentValue = newQuantity * price;
      } else {
        newQuantity = Math.max(0, existing.quantity - quantity);
        if (newQuantity > 0) {
          newAveragePrice = existing.averagePrice;
        } else {
          newAveragePrice = 0;
        }
        newCurrentValue = newQuantity * price;
      }
      await dbRun(
        `UPDATE portfolio SET quantity = ?, averagePrice = ?, currentValue = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE userId = ? AND symbol = ?`,
        [newQuantity, newAveragePrice, newCurrentValue, userId, symbol]
      );
    } else if (orderType === 'BUY') {
      await dbRun(
        `INSERT INTO portfolio (userId, symbol, quantity, averagePrice, currentValue)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, symbol, quantity, price, quantity * price]
      );
    }
  } catch (error) {
    logger.error('Error updating portfolio:', error);
  }
}
export default router;