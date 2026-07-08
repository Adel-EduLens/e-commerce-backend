import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { traderService } from '../services/trader.service.js'

export const traderLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await traderService.login(req.body)
  successResponse(res, {
    statusCode: 200,
    message: 'Trader logged in successfully',
    data: result,
  })
})

export const getTraderMe = asyncHandler(async (req: Request, res: Response) => {
  const trader = await traderService.getMe(Number(req.user!.id))
  successResponse(res, { statusCode: 200, message: 'Trader fetched', data: trader })
})

export const updateTraderMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, address } = req.body
  const trader = await traderService.updateMe(Number(req.user!.id), { name, address })
  successResponse(res, { statusCode: 200, message: 'Profile updated', data: trader })
})
