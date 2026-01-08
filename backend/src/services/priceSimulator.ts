import { dbAll, dbRun, dbGet } from '../database/init';
import { logger } from '../utils/logger';
import { marketDataService } from './marketDataService';
import { isMarketOpen, getMarketStatusMessage } from '../utils/marketHours';
export class PriceSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  start(intervalSeconds: number = 8): void {
    if (this.isRunning) {
      logger.warn('Price simulator is already running');
      return;
    }
    this.isRunning = true;
    logger.info(`Starting price simulator (updates every ${intervalSeconds} seconds during market hours only)`);
    logger.info(`Market status: ${getMarketStatusMessage()}`);
    this.intervalId = setInterval(async () => {
      if (isMarketOpen()) {
        await this.simulatePriceMovement();
      } else {
        logger.debug('Market is closed - price simulator paused');
      }
    }, intervalSeconds * 1000);
    if (isMarketOpen()) {
      this.simulatePriceMovement();
    }
  }
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      logger.info('Price simulator stopped');
    }
  }
  private async simulatePriceMovement(): Promise<void> {
    try {
      const instruments: any[] = await dbAll(
        'SELECT symbol, exchange, lastTradedPrice FROM instruments'
      );
      for (const instrument of instruments) {
        const changePercent = (Math.random() * 4 - 2) / 100;
        const newPrice = Math.max(0.01, instrument.lastTradedPrice * (1 + changePercent));
        await dbRun(
          'UPDATE instruments SET lastTradedPrice = ? WHERE symbol = ? AND exchange = ?',
          [newPrice, instrument.symbol, instrument.exchange]
        );
        logger.debug(
          `Price update: ${instrument.symbol} ${instrument.exchange} - ₹${instrument.lastTradedPrice.toFixed(2)} → ₹${newPrice.toFixed(2)} (${(changePercent * 100).toFixed(2)}%)`
        );
      }
      logger.info(`Updated prices for ${instruments.length} instruments`);
    } catch (error) {
      logger.error('Error in price simulation:', error);
    }
  }
}
export const priceSimulator = new PriceSimulator();