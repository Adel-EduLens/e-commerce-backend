import express from 'express'
import prisma from '../utils/prismaClient.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import AppError from '../utils/AppError.util.js'

const router = express.Router()

// Get all active notifications for the authenticated user
router.get(
  '/user',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const notifications = await prisma.productNotifyMe.findMany({
      where: { userId, isActive: true },
      include: {
        product: {
          include: {
            images: true,
            sizes: true,
            colors: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    successResponse(res, {
      statusCode: 200,
      message: 'Notifications fetched successfully',
      data: notifications,
    })
  })
)

// Subscribe to a product notification
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const { productId } = req.body

    if (!productId) {
      throw new AppError('productId is required', 400)
    }

    const product = await prisma.product.findUnique({
      where: { id: String(productId) },
    })
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    // Upsert: if already exists, reactivate it
    const existing = await prisma.productNotifyMe.findUnique({
      where: {
        userId_productId: { userId, productId: String(productId) },
      },
    })

    let notification
    if (existing) {
      notification = await prisma.productNotifyMe.update({
        where: { id: existing.id },
        data: { isActive: true },
      })
    } else {
      notification = await prisma.productNotifyMe.create({
        data: {
          userId,
          productId: String(productId),
        },
      })
    }

    successResponse(res, {
      statusCode: 201,
      message: 'You will be notified when this product is back in stock',
      data: notification,
    })
  })
)

// Delete / deactivate a notification
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    const userId = Number(req.user!.id)

    const notification = await prisma.productNotifyMe.findUnique({
      where: { id },
    })
    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found', 404)
    }

    await prisma.productNotifyMe.update({
      where: { id },
      data: { isActive: false },
    })

    successResponse(res, {
      statusCode: 200,
      message: 'Notification removed successfully',
    })
  })
)

// Check if user is subscribed to a specific product
router.get(
  '/check/:productId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const productId = req.params.productId

    const notification = await prisma.productNotifyMe.findUnique({
      where: {
        userId_productId: { userId, productId: String(productId) },
      },
    })

    successResponse(res, {
      statusCode: 200,
      data: {
        isSubscribed: notification ? notification.isActive : false,
        notificationId: notification?.id || null,
      },
    })
  })
)

export default router
