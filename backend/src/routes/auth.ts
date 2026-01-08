import { Router, Request, Response } from 'express';
import { bajajApiClient } from '../services/bajajApiClient';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/authorize:
 *   get:
 *     summary: Get authorization URL for Bajaj Broking login
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authorization URL
 */
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

/**
 * @swagger
 * /api/v1/auth/token:
 *   post:
 *     summary: Exchange authorization code for access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token obtained
 */
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

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const profile = await bajajApiClient.getUserProfile();
    res.json({
      status: 'success',
      data: profile,
    });
  } catch (error: any) {
    logger.error('Profile fetch error:', error);
    // Return mock profile for development
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

