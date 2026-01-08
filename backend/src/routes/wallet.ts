import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { walletService } from '../services/walletService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
const router = Router();
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const balance = await walletService.getBalance(userId);
    res.json({
      status: 'success',
      data: balance,
    });
  } catch (error: any) {
    logger.error('Error fetching wallet:', error);
    throw new CustomError('Failed to fetch wallet balance', 500);
  }
});
export default router;