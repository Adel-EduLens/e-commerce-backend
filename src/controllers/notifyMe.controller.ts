import type { Response } from 'express'
import type { AuthenticatedRequest } from '../types/user.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { notifyMeService } from '../services/notifyMe.service.js'

export const getNotifyMeItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notifyMeService.getNotifyMeItems(Number(req.user?.id))

  successResponse(res, {
    statusCode: 200,
    message: 'Notify me items fetched successfully',
    data: result,
  })
})

export const createNotifyMeItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notifyMeService.createNotifyMe(Number(req.user?.id), req.body.productId)

  successResponse(res, {
    statusCode: 201,
    message: 'Notify me item created successfully',
    data: result,
  })
})

export const deleteNotifyMeItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await notifyMeService.deleteNotifyMe(Number(req.user?.id), Number(req.params.id))

  successResponse(res, {
    statusCode: 200,
    message: 'Notify me item removed successfully',
    data: result,
  })
})
