import type { Response, NextFunction, Request } from 'express'
import { verifyToken } from '../utils/jwt.util.js'
import { userRepository } from '../repositories/user.repository.js'
import { adminRepository } from '../repositories/admin.repository.js'
import { traderProfileRepository } from '../repositories/traderProfile.repository.js'
import AppError from '../utils/AppError.util.js'

// =======================================================
// AUTH MIDDLEWARE (MULTI TABLE SEARCH - FIXED VERSION)
// =======================================================
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return next(new AppError('No token provided', 401))
    }

    const decoded = verifyToken(token)
    const id = Number(decoded.id)
    const role = decoded.role

    if (role === 'admin') {
      const admin = await adminRepository.findById(id)
      if (admin) {
        req.user = {
          id: admin.id,
          role: 'admin',
        }
        return next()
      }
    } else if (role === 'trader') {
      const trader = await traderProfileRepository.findById(id)
      if (trader) {
        req.user = {
          id: trader.id,
          role: 'trader',
        }
        return next()
      }
    } else {
      const user = await userRepository.findById(id)
      if (user) {
        req.user = {
          id: user.id,
          role: 'user',
        }
        return next()
      }
    }

    return next(new AppError('User not found', 401))
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401))
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401))
    }

    next(error)
  }
}

// =======================================================
// ROLE-BASED ACCESS CONTROL
// =======================================================
export const requireRole = (...roles: Array<'user' | 'trader' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403))
    }

    next()
  }
}

// =======================================================
// ADMIN ONLY AUTH (CLEAN VERSION)
// =======================================================
export const requireAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization

    if (!token) {
      return next(new AppError('No token provided', 401))
    }
    const decoded = verifyToken(token)
    const admin = await adminRepository.FindById(Number(decoded.id))

    if (!admin) {
      return next(new AppError('Admin not found', 401))
    }
    req.user = {
      id: admin.id,
      role: 'admin',
    }

    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401))
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401))
    }

    next(error)
  }
}
