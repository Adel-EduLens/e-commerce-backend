import express from 'express'
import prisma from '../utils/prismaClient.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import AppError from '../utils/AppError.util.js'

const router = express.Router()

router.use(requireAuth)

// GET /api/notify-me — all active subscriptions for user
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const subs = await prisma.notifyMeSubscription.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    const populatedSubs = await Promise.all(
      subs.map(async (sub) => {
        let product: any = null;
        try {
          if (sub.targetType === 'SHOP_RESTOCK') {
            product = await prisma.product.findUnique({
              where: { id: sub.targetId },
              include: { images: true },
            });
          } else if (sub.targetType === 'RETAIL_RESTOCK') {
            product = await prisma.retailProduct.findUnique({
              where: { id: Number(sub.targetId) },
              include: { images: true },
            });
          } else if (sub.targetType === 'WHOLESALE_RESTOCK') {
            product = await prisma.wholesale.findUnique({
              where: { id: sub.targetId },
              include: { images: true },
            });
          } else if (sub.targetType === 'CATEGORY') {
            const category = await prisma.category.findUnique({
              where: { id: sub.targetId },
            });
            product = category ? { name: category.name, price: 0, stock: 1, images: category.image ? [{ url: category.image }] : [] } : null;
          }
        } catch (error) {
          console.error(`Failed to fetch product for subscription ${sub.id}:`, error);
        }
        return {
          ...sub,
          product,
        };
      })
    );

    successResponse(res, { data: populatedSubs })
  })
)

// GET /api/notify-me/check?targetType=X&targetId=Y
router.get(
  '/check',
  asyncHandler(async (req, res, next) => {
    const userId = Number(req.user!.id)
    const { targetType, targetId } = req.query
    if (!targetType || !targetId) return next(new AppError('targetType and targetId required', 400))
    const sub = await prisma.notifyMeSubscription.findUnique({
      where: { userId_targetType_targetId: { userId, targetType: String(targetType), targetId: String(targetId) } },
    })
    return res.json({ success: true, data: { isSubscribed: !!(sub?.isActive) } })
  })
)

// POST /api/notify-me — subscribe { targetType, targetId }
router.post(
  '/',
  asyncHandler(async (req, res, next) => {
    const userId = Number(req.user!.id)
    const { targetType, targetId } = req.body
    if (!targetType || !targetId) return next(new AppError('targetType and targetId required', 400))
    await prisma.notifyMeSubscription.upsert({
      where: { userId_targetType_targetId: { userId, targetType: String(targetType), targetId: String(targetId) } },
      update: { isActive: true },
      create: { userId, targetType: String(targetType), targetId: String(targetId) },
    })
    successResponse(res, { statusCode: 201, message: 'Subscribed successfully' })
  })
)

// DELETE /api/notify-me — unsubscribe { targetType, targetId }
router.delete(
  '/',
  asyncHandler(async (req, res, next) => {
    const userId = Number(req.user!.id)
    const { targetType, targetId } = req.body
    if (!targetType || !targetId) return next(new AppError('targetType and targetId required', 400))
    await prisma.notifyMeSubscription.updateMany({
      where: { userId, targetType: String(targetType), targetId: String(targetId) },
      data: { isActive: false },
    })
    successResponse(res, { message: 'Unsubscribed successfully' })
  })
)

export default router
