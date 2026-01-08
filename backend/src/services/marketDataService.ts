import axios from 'axios';
import { logger } from '../utils/logger';
import { isMarketOpen } from '../utils/marketHours';

export interface MarketData {
  symbol: string;
  exchange: string;
  instrumentType: string;
  lastTradedPrice: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
}

/**
 * Market Data Service using Alpha Vantage API (Free tier, no demat account required)
 * Fallback to Yahoo Finance API if Alpha Vantage fails
 */
export class MarketDataService {
  private alphaVantageApiKey: string;
  private useRealData: boolean;

  constructor() {
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    // Enable real data by default - use Yahoo Finance (no API key needed)
    this.useRealData = process.env.USE_REAL_MARKET_DATA !== 'false';
  }

  /**
   * Fetch real-time quote from Alpha Vantage or Yahoo Finance
   */
  async getQuote(symbol: string, exchange: string = 'NSE'): Promise<MarketData | null> {
    // Always try to fetch real data (Yahoo Finance doesn't need API key)
    // Only skip if explicitly disabled
    if (process.env.USE_REAL_MARKET_DATA === 'false') {
      logger.debug('Real market data disabled, using cached data');
      return null;
    }

    // Try Yahoo Finance first (no API key needed, more reliable for Indian stocks)
    const yahooQuote = await this.getQuoteFromYahoo(symbol, exchange);
    if (yahooQuote) {
      return yahooQuote;
    }

    // Fallback to Alpha Vantage if API key is provided
    if (this.alphaVantageApiKey && this.alphaVantageApiKey !== 'demo') {
      try {
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: this.formatSymbol(symbol, exchange),
            apikey: this.alphaVantageApiKey,
          },
          timeout: 5000,
        });

        if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
          const quote = response.data['Global Quote'];
          return {
            symbol,
            exchange,
            instrumentType: 'EQUITY',
            lastTradedPrice: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change'] || '0'),
            changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
            volume: parseInt(quote['06. volume'] || '0'),
            high: parseFloat(quote['03. high'] || '0'),
            low: parseFloat(quote['04. low'] || '0'),
            open: parseFloat(quote['02. open'] || '0'),
          };
        }
      } catch (error: any) {
        logger.warn(`Alpha Vantage API error for ${symbol}:`, error.message);
      }
    }

    return null;
  }

  /**
   * Fetch quote from Yahoo Finance (unofficial API, no API key required)
   * When market is closed, returns last closing price with volume = 0
   */
  private async getQuoteFromYahoo(symbol: string, exchange: string): Promise<MarketData | null> {
    try {
      // Format symbol for Yahoo Finance (e.g., RELIANCE.NS for NSE, RELIANCE.BO for BSE)
      const yahooSymbol = exchange === 'NSE' ? `${symbol}.NS` : `${symbol}.BO`;
      
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`, {
        params: {
          interval: '1d',
          range: '1d',
        },
        timeout: 8000,
      });

      if (response.data?.chart?.result?.[0]?.meta) {
        const meta = response.data.chart.result[0].meta;
        const marketOpen = isMarketOpen();
        
        // Always use regularMarketPrice (last traded price) - this is the actual current price
        // When market is open: regularMarketPrice = live price
        // When market is closed: regularMarketPrice = last traded price (same as previousClose if no trading)
        const regularPrice = meta.regularMarketPrice || meta.previousClose || meta.chartPreviousClose || 0;
        const previousClose = meta.previousClose || meta.chartPreviousClose || regularPrice;
        
        // Use API's exact change values if available
        // regularMarketChange and regularMarketChangePercent are the actual change values from API
        let change = meta.regularMarketChange;
        let changePercent = meta.regularMarketChangePercent;
        
        // If API provides change as object with raw/fmt, extract the raw value
        if (change !== undefined && typeof change === 'object' && change !== null) {
          change = change.raw !== undefined ? change.raw : (change.fmt ? parseFloat(change.fmt) : 0);
        }
        if (changePercent !== undefined && typeof changePercent === 'object' && changePercent !== null) {
          changePercent = changePercent.raw !== undefined ? changePercent.raw : (changePercent.fmt ? parseFloat(changePercent.fmt.replace('%', '')) : 0);
        }
        
        // If API doesn't provide change values, calculate from price difference
        // This ensures we always have change values even if API doesn't provide them
        if (change === undefined || changePercent === undefined) {
          change = regularPrice - previousClose;
          changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
        }
        
        // Ensure values are numbers
        change = typeof change === 'number' ? change : parseFloat(change) || 0;
        changePercent = typeof changePercent === 'number' ? changePercent : parseFloat(changePercent) || 0;
        
        // Volume: 
        // When market is open: use regularMarketVolume (current day's volume)
        // When market is closed: use regularMarketVolume (previous day's closing volume - last traded volume)
        // Yahoo Finance API provides regularMarketVolume which contains the last trading day's volume when market is closed
        const volume = meta.regularMarketVolume || meta.volume || 0;
        
        // High/Low: When market is open, use today's high/low
        // When market is closed, use previous day's high/low
        const high = marketOpen 
          ? (meta.regularMarketDayHigh || meta.dayHigh || regularPrice)
          : (meta.previousClose || regularPrice); // Use previous close as high when closed
        
        const low = marketOpen
          ? (meta.regularMarketDayLow || meta.dayLow || regularPrice)
          : (meta.previousClose || regularPrice); // Use previous close as low when closed
        
        const open = marketOpen
          ? (meta.regularMarketOpen || meta.previousOpen || previousClose)
          : previousClose; // Use previous close as open when closed
        
        logger.info(
          `Fetched ${marketOpen ? 'real-time' : 'closing'} data for ${symbol}: ₹${regularPrice} ` +
          `(${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%) ` +
          `Volume: ${volume.toLocaleString()} ${marketOpen ? '(Live)' : '(Last Traded at Close)'}`
        );
        
        return {
          symbol,
          exchange,
          instrumentType: 'EQUITY',
          lastTradedPrice: regularPrice,
          change: change,
          changePercent: changePercent,
          volume: volume,
          high: high,
          low: low,
          open: open,
        };
      }
    } catch (error: any) {
      logger.warn(`Yahoo Finance API error for ${symbol}:`, error.message);
    }

    return null;
  }

  /**
   * Fetch multiple instruments with real market data
   */
  async getMultipleQuotes(symbols: string[], exchange: string = 'NSE'): Promise<MarketData[]> {
    const results: MarketData[] = [];
    
    // Fetch quotes with rate limiting (Alpha Vantage free tier: 5 calls/minute)
    for (const symbol of symbols) {
      const quote = await this.getQuote(symbol, exchange);
      if (quote) {
        results.push(quote);
      }
      // Rate limiting: wait 12 seconds between calls for free tier
      if (symbols.length > 1 && symbol !== symbols[symbols.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }

    return results;
  }

  /**
   * Format symbol for Alpha Vantage
   * For Indian stocks, Alpha Vantage uses format like RELIANCE.BSE or RELIANCE.NSE
     */
  private formatSymbol(symbol: string, exchange: string): string {
    if (exchange === 'NSE') {
      return `${symbol}.NSE`;
    } else if (exchange === 'BSE') {
      return `${symbol}.BSE`;
    }
    return symbol;
  }

  /**
   * Get current market price for order execution
   */
  async getCurrentPrice(symbol: string, exchange: string): Promise<number | null> {
    const quote = await this.getQuote(symbol, exchange);
    return quote?.lastTradedPrice || null;
  }
}

// Singleton instance
export const marketDataService = new MarketDataService();

