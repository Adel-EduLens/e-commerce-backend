import type { Request, Response } from 'express'
import { userNotificationService } from '../services/userNotification.service.js'
import { successResponse } from '../utils/response.util.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import AppError from '../utils/AppError.util.js'

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const notifications = await userNotificationService.getNotifications(userId)
  successResponse(res, {
    statusCode: 200,
    message: 'Notifications fetched successfully',
    data: notifications,
  })
})

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const count = await userNotificationService.getUnreadCount(userId)
  successResponse(res, {
    statusCode: 200,
    data: { count },
  })
})

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const id = Number(req.params.id)
  if (isNaN(id)) {
    throw new AppError('Invalid notification ID', 400)
  }
  await userNotificationService.markRead(id, userId)
  successResponse(res, {
    statusCode: 200,
    message: 'Notification marked as read',
  })
})

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  await userNotificationService.markAllRead(userId)
  successResponse(res, {
    statusCode: 200,
    message: 'All notifications marked as read',
  })
})

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const id = Number(req.params.id)
  if (isNaN(id)) {
    throw new AppError('Invalid notification ID', 400)
  }
  await userNotificationService.deleteNotification(id, userId)
  successResponse(res, {
    statusCode: 200,
    message: 'Notification deleted',
  })
})
