import type { Response, NextFunction } from 'express';
import type { BaseRepository } from '../repositories/base.repository.js';
import { verifyToken } from '../utils/jwt.util.js';
import { userRepository } from '../repositories/user.repository.js';
import { adminRepository } from '../repositories/admin.repository.js';
import type { AuthenticatedRequest } from '../types/user.type.js';
import type { AdminAuthenticatedRequest } from '../types/admin.type.js';
import AppError from '../utils/AppError.util.js';

type AuthRequest = AuthenticatedRequest & AdminAuthenticatedRequest;

const createAuthMiddleware = (
  repository: BaseRepository<any>,
  requestKey: 'user' | 'admin',
  requiredRole?: string
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : undefined;

      if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access.', 401));
      }

      const decoded = verifyToken(token);

      if (requiredRole && decoded.role !== requiredRole) {
        return next(new AppError(`Access denied. ${requiredRole} only.`, 403));
      }

      const doc = await repository.findById(decoded.id, '-password');
      if (!doc) {
        return next(new AppError('The account belonging to this token no longer exists.', 401));
      }

      (req as any)[requestKey] = {
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: requiredRole || doc.role,
        phone: doc.phone,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };

      next();
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired. Please log in again.', 401));
      }
      next(error);
    }
  };
};

export const requireAuth = createAuthMiddleware(userRepository, 'user');

export const requireAdminAuth = createAuthMiddleware(adminRepository, 'admin', 'admin');

export const requireRole = (...roles: Array<'user' | 'trader'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
