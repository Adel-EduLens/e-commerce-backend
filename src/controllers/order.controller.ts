import type { Response } from 'express'
import type { AuthenticatedRequest } from '../types/user.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { orderService } from '../services/order.service.js'

export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await orderService.getOrders(Number(req.user?.id), req.query)

  successResponse(res, {
    statusCode: 200,
    message: 'Orders fetched successfully',
    data: result,
  })
})

export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await orderService.getOrderById(Number(req.user?.id), Number(req.params.orderId))

  successResponse(res, {
    statusCode: 200,
    message: 'Order fetched successfully',
    data: result,
  })
})

export const cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await orderService.cancelOrder(Number(req.user?.id), Number(req.params.orderId))

  successResponse(res, {
    statusCode: 200,
    message: 'Order cancelled successfully',
    data: result,
  })
})
