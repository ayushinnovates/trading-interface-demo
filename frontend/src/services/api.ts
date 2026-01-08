import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http:
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export interface Instrument {
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
export interface Order {
  id: string;
  userId: string;
  symbol: string;
  exchange: string;
  orderType: 'BUY' | 'SELL';
  orderStyle: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  status: 'NEW' | 'PLACED' | 'EXECUTED' | 'CANCELLED';
  executedPrice?: number;
  executedQuantity?: number;
  createdAt: string;
  updatedAt: string;
}
export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  exchange: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  executedAt: string;
}
export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  averageBuyPrice: number;
  currentMarketPrice: number;
  currentValue: number;
  realizedPnL: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  totalPnL: number;
}
export const apiService = {
  getInstruments: async (): Promise<Instrument[]> => {
    const response = await api.get('/api/v1/instruments');
    return response.data.data;
  },
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/api/v1/orders');
    return response.data.data;
  },
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/api/v1/orders/${orderId}`);
    return response.data.data;
  },
  placeOrder: async (orderData: {
    symbol: string;
    exchange: string;
    orderType: 'BUY' | 'SELL';
    orderStyle: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
  }): Promise<Order> => {
    const response = await api.post('/api/v1/orders', orderData);
    return response.data.data;
  },
  getTrades: async (): Promise<Trade[]> => {
    const response = await api.get('/api/v1/trades');
    return response.data.data;
  },
  getPortfolio: async (): Promise<PortfolioHolding[]> => {
    const response = await api.get('/api/v1/portfolio');
    return response.data.data;
  },
  getAuthUrl: async (): Promise<string> => {
    const response = await api.get('/api/v1/auth/authorize');
    return response.data.data.authorizationUrl;
  },
  getWallet: async (): Promise<{ availableBalance: number; totalInvested: number }> => {
    const response = await api.get('/api/v1/wallet');
    return response.data.data;
  },
  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await api.delete(`/api/v1/orders/${orderId}`);
    return response.data.data;
  },
  getOrderBook: async (symbol: string): Promise<any> => {
    const response = await api.get(`/api/v1/orderbook/${symbol}`);
    return response.data.data;
  },
  getTradesFiltered: async (filters?: {
    symbol?: string;
    side?: 'BUY' | 'SELL';
    fromDate?: string;
    toDate?: string;
  }): Promise<Trade[]> => {
    const params = new URLSearchParams();
    if (filters?.symbol) params.append('symbol', filters.symbol);
    if (filters?.side) params.append('side', filters.side);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    const response = await api.get(`/api/v1/trades?${params.toString()}`);
    return response.data.data;
  },
};
export default api;