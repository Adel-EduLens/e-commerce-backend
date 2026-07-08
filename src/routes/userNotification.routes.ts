import express from 'express'
import prisma from '../utils/prismaClient.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import AppError from '../utils/AppError.util.js'

const router = express.Router()

// ===== User Notifications =====

// Get all notifications for the authenticated user
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const notifications = await prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    successResponse(res, {
      statusCode: 200,
      message: 'Notifications fetched successfully',
      data: notifications,
    })
  })
)

// Get unread count
router.get(
  '/unread-count',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const count = await prisma.userNotification.count({
      where: { userId, isRead: false },
    })
    successResponse(res, {
      statusCode: 200,
      data: { count },
    })
  })
)

// Mark a notification as read
router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const id = Number(req.params.id)
    await prisma.userNotification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    })
    successResponse(res, {
      statusCode: 200,
      message: 'Notification marked as read',
    })
  })
)

// Mark all as read
router.patch(
  '/read-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    await prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    successResponse(res, {
      statusCode: 200,
      message: 'All notifications marked as read',
    })
  })
)

// Delete a notification
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = Number(req.user!.id)
    const id = Number(req.params.id)
    await prisma.userNotification.deleteMany({
      where: { id, userId },
    })
    successResponse(res, {
      statusCode: 200,
      message: 'Notification deleted',
    })
  })
)

export default router
