import type { Response, NextFunction, Request } from 'express'
import { verifyToken } from '../utils/jwt.util.js'
import { userRepository } from '../repositories/user.repository.js'
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
    const token = req.headers.token as string
    if (!token) {
      return next(new AppError('No token provided', 401))
    }

    const decoded = verifyToken(token)
    const id = Number(decoded.id)
    const role = decoded.role

    if (role === 'trader') {
      const trader = await traderProfileRepository.findById(id, {
        id: true,
        role: true,
      })
      if (trader) {
        req.user = {
          id: trader.id,
          role: 'trader',
        }
        return next()
      }
    } else {
      const user = await userRepository.findById(id, {
        id: true,
        role: true,
      })
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
// OPTIONAL AUTH (attaches user if token present, continues if not)
// =======================================================
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.token as string
    if (!token) {
      return next()
    }

    const decoded = verifyToken(token)
    const id = Number(decoded.id)
    const role = decoded.role
    if (role === 'trader') {
      const trader = await traderProfileRepository.findById(id, { id: true, role: true })
      if (trader) {
        req.user = { id: trader.id, role: 'trader' }
      }
    } else {
      const user = await userRepository.findById(id, { id: true, role: true })
      if (user) {
        req.user = { id: user.id, role: 'user' }
      }
    }

    next()
  } catch {
    next()
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
    const token = req.headers.token as string

    if (!token) {
      return next(new AppError('No token provided', 401))
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
