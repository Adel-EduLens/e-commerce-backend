import { Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { RetailProductRatingService } from '../services/retailProductRating.service.js'
import type { AuthenticatedRequest } from '../types/user.type.js'
import AppError from '../utils/AppError.util.js'

const ratingService = new RetailProductRatingService()

// POST /api/retail/products/:id/rating
export const rateRetailProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id ? Number(req.user.id) : null
  if (!userId) {
    return res.status(401).json({ success: false, message: 'You must be logged in to rate a product' })
  }

  const retailProductId = Number(req.params.id)
  const { rating } = req.body

  if (!rating || isNaN(Number(rating))) {
    return res.status(400).json({ success: false, message: 'Rating value is required' })
  }

  const result = await ratingService.rateProduct(userId, retailProductId, Number(rating))
  return successResponse(res, {
    statusCode: 200,
    message: 'Rating saved successfully',
    data: result,
  })
})

// POST /api/ratings  (unified endpoint called by frontend first)
export const rateProductUnified = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id ? Number(req.user.id) : null
  if (!userId) {
    return res.status(401).json({ success: false, message: 'You must be logged in to rate a product' })
  }

  const { productType, productId, rating } = req.body

  if (!productType || !productId || !rating) {
    return res.status(400).json({ success: false, message: 'productType, productId and rating are required' })
  }

  if (!['RETAIL', 'WHOLESALE', 'SHOP'].includes(productType)) {
    return res.status(400).json({ success: false, message: 'productType must be RETAIL, WHOLESALE, or SHOP' })
  }

  if (productType !== 'RETAIL') {
    return res.status(400).json({ success: false, message: `Rating for ${productType} products is not supported yet` })
  }

  const result = await ratingService.rateProduct(userId, Number(productId), Number(rating))
  return successResponse(res, {
    statusCode: 200,
    message: 'Rating saved successfully',
    data: result,
  })
})

// GET /api/retail/products/:id/rating
export const getRetailProductRating = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const retailProductId = Number(req.params.id)
  const result = await ratingService.getProductRatings(retailProductId)
  return successResponse(res, {
    statusCode: 200,
    message: 'Rating fetched successfully',
    data: result,
  })
})
