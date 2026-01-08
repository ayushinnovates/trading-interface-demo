import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  logger.error(`Error ${statusCode}: ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
  });
  res.status(statusCode).json({
    status,
    statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
export class CustomError extends Error implements AppError {
  statusCode: number;
  status: string;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}