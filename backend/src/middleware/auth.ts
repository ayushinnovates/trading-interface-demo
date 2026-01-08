import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (process.env.NODE_ENV === 'production') {
      throw new CustomError('Authentication required', 401);
    }
    (req as any).userId = 'MOCK_USER_001';
    return next();
  }
  const token = authHeader.substring(7);
  if (token === 'mock_token' || token.length > 0) {
    (req as any).userId = 'MOCK_USER_001';
    return next();
  }
  throw new CustomError('Invalid authentication token', 401);
};