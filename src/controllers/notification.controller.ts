import type { Response } from 'express'
import type { AuthenticatedRequest } from '../types/user.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { notificationService } from '../services/notification.service.js'

export const getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationService.getNotifications(Number(req.user?.id), req.query)

  successResponse(res, {
    statusCode: 200,
    message: 'Notifications fetched successfully',
    data: result,
  })
})

export const getUnreadNotificationsCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationService.getUnreadCount(Number(req.user?.id))

  successResponse(res, {
    statusCode: 200,
    message: 'Unread notifications count fetched successfully',
    data: result,
  })
})

export const markNotificationAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationService.markAsRead(Number(req.user?.id), Number(req.params.notificationId))

  successResponse(res, {
    statusCode: 200,
    message: 'Notification marked as read successfully',
    data: result,
  })
})

export const markAllNotificationsAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationService.markAllAsRead(Number(req.user?.id))

  successResponse(res, {
    statusCode: 200,
    message: 'All notifications marked as read successfully',
    data: result,
  })
})

export const deleteNotification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notificationService.deleteNotification(Number(req.user?.id), Number(req.params.notificationId))

  successResponse(res, {
    statusCode: 200,
    message: 'Notification deleted successfully',
    data: result,
  })
})
