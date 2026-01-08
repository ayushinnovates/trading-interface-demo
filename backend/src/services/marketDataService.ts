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
export class MarketDataService {
  private alphaVantageApiKey: string;
  private useRealData: boolean;
  constructor() {
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
    this.useRealData = process.env.USE_REAL_MARKET_DATA !== 'false';
  }
  async getQuote(symbol: string, exchange: string = 'NSE'): Promise<MarketData | null> {
    if (process.env.USE_REAL_MARKET_DATA === 'false') {
      logger.debug('Real market data disabled, using cached data');
      return null;
    }
    const yahooQuote = await this.getQuoteFromYahoo(symbol, exchange);
    if (yahooQuote) {
      return yahooQuote;
    }
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
  private async getQuoteFromYahoo(symbol: string, exchange: string): Promise<MarketData | null> {
    try {
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
        const regularPrice = meta.regularMarketPrice || meta.previousClose || meta.chartPreviousClose || 0;
        const previousClose = meta.previousClose || meta.chartPreviousClose || regularPrice;
        let change = meta.regularMarketChange;
        let changePercent = meta.regularMarketChangePercent;
        if (change !== undefined && typeof change === 'object' && change !== null) {
          change = change.raw !== undefined ? change.raw : (change.fmt ? parseFloat(change.fmt) : 0);
        }
        if (changePercent !== undefined && typeof changePercent === 'object' && changePercent !== null) {
          changePercent = changePercent.raw !== undefined ? changePercent.raw : (changePercent.fmt ? parseFloat(changePercent.fmt.replace('%', '')) : 0);
        }
        if (change === undefined || changePercent === undefined) {
          change = regularPrice - previousClose;
          changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
        }
        change = typeof change === 'number' ? change : parseFloat(change) || 0;
        changePercent = typeof changePercent === 'number' ? changePercent : parseFloat(changePercent) || 0;
        const volume = meta.regularMarketVolume || meta.volume || 0;
        const high = marketOpen
          ? (meta.regularMarketDayHigh || meta.dayHigh || regularPrice)
          : (meta.previousClose || regularPrice);
        const low = marketOpen
          ? (meta.regularMarketDayLow || meta.dayLow || regularPrice)
          : (meta.previousClose || regularPrice);
        const open = marketOpen
          ? (meta.regularMarketOpen || meta.previousOpen || previousClose)
          : previousClose;
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
  async getMultipleQuotes(symbols: string[], exchange: string = 'NSE'): Promise<MarketData[]> {
    const results: MarketData[] = [];
    for (const symbol of symbols) {
      const quote = await this.getQuote(symbol, exchange);
      if (quote) {
        results.push(quote);
      }
      if (symbols.length > 1 && symbol !== symbols[symbols.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }
    return results;
  }
  private formatSymbol(symbol: string, exchange: string): string {
    if (exchange === 'NSE') {
      return `${symbol}.NSE`;
    } else if (exchange === 'BSE') {
      return `${symbol}.BSE`;
    }
    return symbol;
  }
  async getCurrentPrice(symbol: string, exchange: string): Promise<number | null> {
    const quote = await this.getQuote(symbol, exchange);
    return quote?.lastTradedPrice || null;
  }
}
export const marketDataService = new MarketDataService();