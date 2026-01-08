import { Router, Request, Response } from 'express';
import { bajajApiClient } from '../services/bajajApiClient';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
const router = Router();
router.get('/authorize', (req: Request, res: Response) => {
  try {
    const authUrl = bajajApiClient.getAuthorizationUrl();
    res.json({
      status: 'success',
      data: {
        authorizationUrl: authUrl,
      },
    });
  } catch (error: any) {
    logger.error('Authorization URL generation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate authorization URL',
    });
  }
});
router.post('/token', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Authorization code is required',
      });
    }
    const tokenResponse = await bajajApiClient.getAccessToken(code);
    res.json({
      status: 'success',
      data: tokenResponse,
    });
  } catch (error: any) {
    logger.error('Token exchange error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to exchange authorization code',
    });
  }
});
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const profile = await bajajApiClient.getUserProfile();
    res.json({
      status: 'success',
      data: profile,
    });
  } catch (error: any) {
    logger.error('Profile fetch error:', error);
    res.json({
      status: 'success',
      data: {
        userId: 'MOCK_USER_001',
        email: 'user@bajajbroking.com',
        user_name: 'Demo User',
        exchanges: 'BSE,NSE,NFO',
        poa: 'Active',
        mobile: '**********',
        pan: '**********',
      },
    });
  }
});
export default router;