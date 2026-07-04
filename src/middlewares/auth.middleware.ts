import type { Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.util.js'
import { userRepository } from '../repositories/user.repository.js'
import { adminRepository } from '../repositories/admin.repository.js'
import type { AuthenticatedRequest } from '../types/user.type.js'
import type { AdminAuthenticatedRequest } from '../types/admin.type.js'
import AppError from '../utils/AppError.util.js'

type AuthRequest = AuthenticatedRequest & AdminAuthenticatedRequest

const createAuthMiddleware = (
  requestKey: 'user' | 'admin',
  requiredRole?: string
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : undefined
      if (!token) {
        return next(
          new AppError(
            'You are not logged in. Please log in to get access.',
            401
          )
        )
      }

      const decoded = verifyToken(token)

      if (requiredRole && decoded.role !== requiredRole) {
        return next(new AppError(`Access denied. ${requiredRole} only.`, 403))
      }

      const entityId = Number(decoded.id)

      if (requestKey === 'user') {
        const user = await userRepository.findById(entityId)
        if (!user) {
          return next(new AppError('User not authenticated.', 401))
        }
        req.user = user
      } else {
        const admin = await adminRepository.findById(String(entityId))
        if (!admin) {
          return next(new AppError('Admin not authenticated.', 401))
        }
        req.admin = admin
      }

      next()
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401))
      }
      if (error.name === 'TokenExpiredError') {
        return next(
          new AppError('Your token has expired. Please log in again.', 401)
        )
      }
      next(error)
    }
  }
}

export const requireAuth = createAuthMiddleware('user')

export const requireAdminAuth = createAuthMiddleware('admin', 'admin')

export const requireRole = (...roles: Array<'user' | 'trader'>) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 401))
    }

    if (!roles.some((role) => req.user?.role === role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      )
    }

    next()
  }
}
