import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { notificationRepository } from '../repositories/notification.repository.js'

export const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const subs = await notificationRepository.getSubscriptions(userId)
  successResponse(res, { statusCode: 200, message: 'Subscriptions fetched', data: subs.map(s => s.categoryId) })
})

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const { categoryId } = req.body
  const existing = await notificationRepository.isSubscribed(userId, categoryId)
  if (!existing) await notificationRepository.subscribe(userId, categoryId)
  successResponse(res, { statusCode: 200, message: 'Subscribed', data: null })
})

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const categoryId = req.params.categoryId as string
  await notificationRepository.unsubscribe(userId, categoryId)
  successResponse(res, { statusCode: 200, message: 'Unsubscribed', data: null })
})

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const [notifications, unread] = await Promise.all([
    notificationRepository.getUserNotifications(userId),
    notificationRepository.countUnread(userId),
  ])
  successResponse(res, { statusCode: 200, message: 'Notifications fetched', data: { notifications, unread } })
})

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  await notificationRepository.markRead(Number(req.params.id), userId)
  successResponse(res, { statusCode: 200, message: 'Marked as read', data: null })
})

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  await notificationRepository.markAllRead(userId)
  successResponse(res, { statusCode: 200, message: 'All marked as read', data: null })
})
