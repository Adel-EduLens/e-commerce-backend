import type { Request, Response, NextFunction } from 'express'
import { wishlistService } from '../services/wishlist.service.js'
import { successResponse } from '../utils/response.util.js'
import AppError from '../utils/AppError.util.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const items = await wishlistService.getWishlist(userId)
  return successResponse(res, { data: items })
})

export const getWishlistStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user!.id)
    const { productType, productId } = req.query

    if (!productType || !productId) {
      return next(new AppError('productType and productId are required', 400))
    }

    const result = await wishlistService.getStatus(userId, String(productType), String(productId))
    return res.json({ success: true, ...result })
  }
)

export const toggleWishlist = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user!.id)
    const { productType, productId } = req.body

    if (!productType || !productId) {
      return next(new AppError('productType and productId are required', 400))
    }

    const result = await wishlistService.toggle(userId, String(productType), String(productId))
    return res.json({ success: true, ...result })
  }
)
