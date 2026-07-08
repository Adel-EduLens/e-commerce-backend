import { Request, Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { RetailNotifyMeService } from '../services/retailNotifyMe.service.js'

const retailNotifyMeService = new RetailNotifyMeService()

export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params
  const notifications = await retailNotifyMeService.getUserNotifications(Number(userId))
  successResponse(res, {
    statusCode: 200,
    message: 'Notifications fetched successfully',
    data: notifications,
  })
})

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, retailProductId } = req.body
  const notification = await retailNotifyMeService.createNotification(userId, retailProductId)
  successResponse(res, {
    statusCode: 201,
    message: 'Notification created successfully',
    data: notification,
  })
})

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const { userId, retailProductId } = req.body
  await retailNotifyMeService.deleteNotificationByUserAndProduct(Number(userId), Number(retailProductId))
  successResponse(res, {
    statusCode: 200,
    message: 'Notification deactivated successfully',
  })
})

export const deleteNotificationByProduct = asyncHandler(async (req: Request, res: Response) => {
  const { userId, retailProductId } = req.params
  await retailNotifyMeService.deleteNotificationByUserAndProduct(Number(userId), Number(retailProductId))
  successResponse(res, {
    statusCode: 200,
    message: 'Subscription cancelled successfully',
  })
})
