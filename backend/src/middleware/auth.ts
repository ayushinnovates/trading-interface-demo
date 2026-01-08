import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

// Mock authentication middleware
// In production, this would validate JWT tokens from Bajaj Broking
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // For assignment purposes, we'll use a simple header-based auth
  // In real implementation, this would validate JWT from Bajaj Broking
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For development, allow requests without auth
    // In production, this should throw an error
    if (process.env.NODE_ENV === 'production') {
      throw new CustomError('Authentication required', 401);
    }
    // Mock user ID for development
    (req as any).userId = 'MOCK_USER_001';
    return next();
  }

  const token = authHeader.substring(7);
  
  // Mock token validation
  // In production, validate against Bajaj Broking token
  if (token === 'mock_token' || token.length > 0) {
    (req as any).userId = 'MOCK_USER_001';
    return next();
  }

  throw new CustomError('Invalid authentication token', 401);
};

