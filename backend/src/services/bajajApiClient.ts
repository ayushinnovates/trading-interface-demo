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
    this.baseUrl = process.env.BAJAJ_API_BASE_URL || 'https://apitrading.bajajbroking.in/api';
    this.bridgeLinkUrl = process.env.BAJAJ_BRIDGELINK_URL || 'https://bridgelink.bajajbroking.in/api';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    this.redirectUrl = process.env.REDIRECT_URL || 'http://localhost:3000/callback';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add request interceptor to include auth token
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

    // Add response interceptor for error handling
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

  /**
   * Step 1: Generate authorization URL
   */
  getAuthorizationUrl(): string {
    return `${this.bridgeLinkUrl}/user/authorize?redirect_url=${encodeURIComponent(this.redirectUrl)}&partnerCredential=${this.clientId}`;
  }

  /**
   * Step 2: Exchange authorization code for access token
   */
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

  /**
   * Set access token manually (for testing or when token is obtained externally)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get user profile
   */
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

  /**
   * Fetch instruments from Bajaj Broking API
   * Note: This is a placeholder - actual endpoint may vary
   */
  async getInstruments(): Promise<any[]> {
    try {
      // This endpoint may need to be adjusted based on actual Bajaj API
      const response = await this.client.get('/market/instruments');
      return response.data.data || response.data || [];
    } catch (error: any) {
      logger.warn('Failed to fetch instruments from Bajaj API, using local data:', error.message);
      // Return empty array to fall back to local data
      return [];
    }
  }

  /**
   * Place order through Bajaj Broking API
   * Note: This is a placeholder - actual endpoint may vary
   */
  async placeOrder(orderData: any): Promise<any> {
    try {
      const response = await this.client.post('/orders', orderData);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to place order through Bajaj API:', error.message);
      throw error;
    }
  }

  /**
   * Get portfolio from Bajaj Broking API
   * Note: This is a placeholder - actual endpoint may vary
   */
  async getPortfolio(): Promise<any[]> {
    try {
      const response = await this.client.get('/portfolio');
      return response.data.data || response.data || [];
    } catch (error: any) {
      logger.warn('Failed to fetch portfolio from Bajaj API, using local data:', error.message);
      return [];
    }
  }
}

// Singleton instance
export const bajajApiClient = new BajajApiClient();

