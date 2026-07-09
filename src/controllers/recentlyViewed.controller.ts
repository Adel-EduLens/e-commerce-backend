import type { Request, Response, NextFunction } from 'express'
import { recentlyViewedService } from '../services/recentlyViewed.service.js'
import { successResponse } from '../utils/response.util.js'
import AppError from '../utils/AppError.util.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'

export const getRecentlyViewed = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const items = await recentlyViewedService.getRecentlyViewed(userId)
  return successResponse(res, { data: items })
})

export const addRecentlyViewed = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user!.id)
    const { productType, productId } = req.body

    if (!productType || !productId) {
      return next(new AppError('productType and productId are required', 400))
    }

    const result = await recentlyViewedService.addViewedProduct(userId, String(productType), String(productId))
    return res.json({ success: true, ...result })
  }
)
