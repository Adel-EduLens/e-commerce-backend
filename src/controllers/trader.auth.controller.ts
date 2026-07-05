import type { Request, Response } from 'express'
import { adminAuthService } from '../services/admin.auth.service.js'
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
