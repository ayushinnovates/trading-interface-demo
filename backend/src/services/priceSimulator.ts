import { dbAll, dbRun, dbGet } from '../database/init';
import { logger } from '../utils/logger';
import { marketDataService } from './marketDataService';
import { isMarketOpen, getMarketStatusMessage } from '../utils/marketHours';

/**
 * Price Movement Simulator
 * Only runs during market hours (9:15 AM - 3:30 PM IST, Monday-Friday)
 * When market is closed, prices remain static at last closing price
 */
export class PriceSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Start the price simulator (only active during market hours)
   */
  start(intervalSeconds: number = 8): void {
    if (this.isRunning) {
      logger.warn('Price simulator is already running');
      return;
    }

    this.isRunning = true;
    logger.info(`Starting price simulator (updates every ${intervalSeconds} seconds during market hours only)`);
    logger.info(`Market status: ${getMarketStatusMessage()}`);

    this.intervalId = setInterval(async () => {
      // Only simulate price movement when market is open
      if (isMarketOpen()) {
        await this.simulatePriceMovement();
      } else {
        logger.debug('Market is closed - price simulator paused');
      }
    }, intervalSeconds * 1000);

    // Run once immediately if market is open
    if (isMarketOpen()) {
      this.simulatePriceMovement();
    }
  }

  /**
   * Stop the price simulator
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      logger.info('Price simulator stopped');
    }
  }

  /**
   * Simulate price movement for all instruments
   */
  private async simulatePriceMovement(): Promise<void> {
    try {
      const instruments: any[] = await dbAll(
        'SELECT symbol, exchange, lastTradedPrice FROM instruments'
      );

      for (const instrument of instruments) {
        // Random price change between -2% to +2%
        const changePercent = (Math.random() * 4 - 2) / 100; // -2% to +2%
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

