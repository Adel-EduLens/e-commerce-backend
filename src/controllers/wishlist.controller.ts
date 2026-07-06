import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { wishlistService } from '../services/wishlist.service.js'
import { wishlistStatusSchema } from '../schemas/wishlist.schema.js'
import AppError from '../utils/AppError.util.js'
import type { AuthenticatedRequest } from '../types/user.type.js'
import type { WishlistProductType } from '@prisma/client'

export const getWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id ? Number(req.user.id) : null
  if (!userId) {
    return res.status(200).json({ success: true, items: [] })
  }

  const items = await wishlistService.getWishlist(userId)
  return res.status(200).json({ success: true, items })
})

export const getWishlistStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id ? Number(req.user.id) : null

  const { error, value } = wishlistStatusSchema.validate(req.query)
  if (error) {
    const errors: Record<string, string[]> = {}
    error.details.forEach((detail: any) => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    return res.status(400).json({ success: false, message: 'Validation error', errors })
  }

  if (!userId) {
    return res.status(200).json({ success: true, isWishlisted: false })
  }

  const { productType, productId } = value as { productType: string; productId: string }
  const status = await wishlistService.getWishlistStatus(userId, productType as WishlistProductType, String(productId))
  return res.status(200).json({ success: true, isWishlisted: status.isWishlisted })
})

export const toggleWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id ? Number(req.user.id) : null
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  const result = await wishlistService.toggleWishlist(userId, req.body.productType as WishlistProductType, String(req.body.productId))
  return res.status(200).json({ success: true, ...result })
})

export const deleteWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id)
  if (!userId) {
    throw new AppError('User not authenticated', 401)
  }

  const result = await wishlistService.deleteWishlist(userId, req.body.productType as WishlistProductType, String(req.body.productId))
  return res.status(200).json({ success: true, ...result })
})
