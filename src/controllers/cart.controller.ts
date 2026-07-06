import type { Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { CartService } from '../services/cart.service.js'
import type { AuthenticatedRequest } from '../types/user.type.js'

const cartService = new CartService()

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id ?? (req.query.userId as string | undefined))
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  const cart = await cartService.getCart(userId)
  return res.status(200).json({ success: true, cart })
})

export const addCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id ?? (req.body.userId as string | undefined))
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  const cart = await cartService.addItem(userId, req.body)
  return res.status(201).json({ success: true, message: 'Item added to cart successfully', cart })
})

export const addRetailCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id ?? (req.body.userId as string | undefined))
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  // Validate that retailProductId is provided for this endpoint
  if (!req.body.retailProductId) {
    return res.status(400).json({ success: false, message: 'retailProductId is required' })
  }

  const cart = await cartService.addItem(userId, req.body)
  return res.status(201).json({ success: true, message: 'Retail item added to cart successfully', cart })
})

export const updateCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id ?? (req.body.userId as string | undefined))
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  const { itemId } = req.params
  const cart = await cartService.updateItemQuantity(userId, Number(itemId), req.body.quantity)
  return res.status(200).json({ success: true, message: 'Cart item updated successfully', cart })
})

export const removeCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id ?? (req.query.userId as string | undefined))
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  const { itemId } = req.params
  const cart = await cartService.removeItem(userId, Number(itemId))
  return res.status(200).json({ success: true, message: 'Cart item removed successfully', cart })
})

export const clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.user?.id ?? (req.query.userId as string | undefined))
  if (!userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' })
  }

  const cart = await cartService.clearCart(userId)
  return res.status(200).json({ success: true, message: 'Cart cleared successfully', cart })
})
