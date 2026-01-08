import { dbRun, dbGet } from '../database/init';
import { logger } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export class WalletService {
  /**
   * Get wallet balance for user
   */
  async getBalance(userId: string): Promise<{ availableBalance: number; totalInvested: number }> {
    try {
      const wallet: any = await dbGet('SELECT * FROM wallet WHERE userId = ?', [userId]);
      
      if (!wallet) {
        // Initialize wallet with default balance
        await dbRun(
          'INSERT INTO wallet (userId, availableBalance) VALUES (?, ?)',
          [userId, 1000000]
        );
        return { availableBalance: 1000000, totalInvested: 0 };
      }

      return {
        availableBalance: wallet.availableBalance || 0,
        totalInvested: wallet.totalInvested || 0,
      };
    } catch (error) {
      logger.error('Error fetching wallet balance:', error);
      throw new CustomError('Failed to fetch wallet balance', 500);
    }
  }

  /**
   * Check if user has sufficient balance
   */
  async hasSufficientBalance(userId: string, requiredAmount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance.availableBalance >= requiredAmount;
  }

  /**
   * Deduct amount from wallet (for BUY orders)
   */
  async deductBalance(userId: string, amount: number): Promise<void> {
    try {
      const balance = await this.getBalance(userId);
      if (balance.availableBalance < amount) {
        throw new CustomError('Insufficient balance', 400);
      }

      await dbRun(
        `UPDATE wallet 
         SET availableBalance = availableBalance - ?, 
             totalInvested = totalInvested + ?,
             updatedAt = CURRENT_TIMESTAMP
         WHERE userId = ?`,
        [amount, amount, userId]
      );

      logger.info(`Deducted ₹${amount} from wallet for user ${userId}`);
    } catch (error: any) {
      if (error instanceof CustomError) {
        throw error;
      }
      logger.error('Error deducting balance:', error);
      throw new CustomError('Failed to deduct balance', 500);
    }
  }

  /**
   * Credit amount to wallet (for SELL orders)
   */
  async creditBalance(userId: string, amount: number, realizedPnL: number = 0): Promise<void> {
    try {
      await dbRun(
        `UPDATE wallet 
         SET availableBalance = availableBalance + ?,
             totalInvested = totalInvested - ?,
             updatedAt = CURRENT_TIMESTAMP
         WHERE userId = ?`,
        [amount, amount, userId]
      );

      logger.info(`Credited ₹${amount} to wallet for user ${userId}`);
    } catch (error) {
      logger.error('Error crediting balance:', error);
      throw new CustomError('Failed to credit balance', 500);
    }
  }
}

export const walletService = new WalletService();

