import type { Request, Response, NextFunction } from 'express';
import { errorResponse } from './response.util.js';
import AppError from './AppError.util.js';
import { Prisma } from '@prisma/client';

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

  // Prisma Error Mapping
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const targetStr = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(', ')
        : err.meta?.target
          ? String(err.meta.target)
          : '';
      const target = targetStr ? ` on ${targetStr}` : '';

      err = new AppError(`Duplicate field value entered${target}`, 400);
    } else if (err.code === 'P2025') {
      err = new AppError('Record not found', 404);
    } else if (err.code === 'P2003') {
      err = new AppError('Foreign key constraint failed', 400);
    } else {
      err = new AppError(`Database error: ${err.message.split('\\n').pop()}`, 400);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    err = new AppError('Database validation error', 400);
  }

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
