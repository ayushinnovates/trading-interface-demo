import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
export interface BajajAuthResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}
export interface BajajUserProfile {
  userId: string;
  email: string;
  user_name: string;
  exchanges: string;
  poa: string;
  mobile: string;
  pan: string;
}
export class BajajApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private baseUrl: string;
  private bridgeLinkUrl: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUrl: string;
  constructor() {
    this.baseUrl = process.env.BAJAJ_API_BASE_URL || 'https://apitrading.bajajbroking.in';
    this.bridgeLinkUrl = process.env.BAJAJ_BRIDGELINK_URL || 'https://bridgelink.bajajbroking.in';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    this.redirectUrl = process.env.REDIRECT_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Bajaj API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }
  getAuthorizationUrl(): string {
    return `${this.bridgeLinkUrl}/user/authorize?redirect_url=${encodeURIComponent(this.redirectUrl)}&partnerCredential=${this.clientId}`;
  }
  async getAccessToken(code: string): Promise<BajajAuthResponse> {
    try {
      const response = await axios.post<BajajAuthResponse>(
        `${this.bridgeLinkUrl}/user/token`,
        {
          grant_type: 'authorization_code',
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        logger.info('Access token obtained successfully');
      }
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get access token:', error.message);
      throw new Error(`Failed to authenticate with Bajaj Broking: ${error.message}`);
    }
  }
  setAccessToken(token: string): void {
    this.accessToken = token;
  }
  async getUserProfile(): Promise<BajajUserProfile> {
    try {
      const response = await this.client.get<{
        statusCode: number;
        message: string;
        data: BajajUserProfile;
      }>('/user/userProfile');
      if (response.data.statusCode === 0) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch user profile');
    } catch (error: any) {
      logger.error('Failed to get user profile:', error.message);
      throw error;
    }
  }
  async getInstruments(): Promise<any[]> {
    try {
      const response = await this.client.get('/market/instruments');
      return response.data.data || response.data || [];
    } catch (error: any) {
      logger.warn('Failed to fetch instruments from Bajaj API, using local data:', error.message);
      return [];
    }
  }
  async placeOrder(orderData: any): Promise<any> {
    try {
      const response = await this.client.post('/orders', orderData);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to place order through Bajaj API:', error.message);
      throw error;
    }
  }
  async getPortfolio(): Promise<any[]> {
    try {
      const response = await this.client.get('/portfolio');
      if (response.data && typeof response.data === 'object' && !response.data.includes) {
        return response.data.data || response.data || [];
      }
      return [];
    } catch (error: any) {
      logger.warn('Failed to fetch portfolio from Bajaj API, using local data:', error.message);
      return [];
    }
  }
}
export const bajajApiClient = new BajajApiClient();