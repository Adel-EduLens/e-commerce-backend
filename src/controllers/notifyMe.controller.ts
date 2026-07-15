import type { Request, Response } from 'express'
import { notifyMeService } from '../services/notifyMe.service.js'
import { successResponse } from '../utils/response.util.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import AppError from '../utils/AppError.util.js'

export const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const data = await notifyMeService.getSubscriptions(userId)
  successResponse(res, { data })
})

export const checkSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const { targetType, targetId } = req.query
  if (!targetType || !targetId) {
    throw new AppError('targetType and targetId required', 400)
  }
  const data = await notifyMeService.checkSubscription(userId, String(targetType), String(targetId))
  successResponse(res, { data })
})

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const { targetType, targetId } = req.body
  if (!targetType || !targetId) {
    throw new AppError('targetType and targetId required', 400)
  }
  await notifyMeService.subscribe(userId, String(targetType), String(targetId))
  successResponse(res, { statusCode: 201, message: 'Subscribed successfully' })
})

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.user!.id)
  const { targetType, targetId } = req.body
  if (!targetType || !targetId) {
    throw new AppError('targetType and targetId required', 400)
  }
  await notifyMeService.unsubscribe(userId, String(targetType), String(targetId))
  successResponse(res, { message: 'Unsubscribed successfully' })
})
