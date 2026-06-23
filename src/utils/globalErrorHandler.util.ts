import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from './response.util.js';
import AppError from './AppError.util.js';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  if (!(err instanceof AppError)) {
    return errorResponse(res, {
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : err.message || 'An unexpected error occurred.',
      statusCode: 500,
    });
  }

  return errorResponse(res, {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
    details: err.details || undefined,
  });
}
