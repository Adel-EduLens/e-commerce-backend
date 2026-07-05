import type { Request, Response } from 'express'
import { authService } from '../services/auth.service.js'
import { successResponse } from '../utils/response.util.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'

export const getVideosByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.getVideosByCategory(
      req.params.category as string
    )
    successResponse(res, {
      statusCode: 200,
      data: result,
    })
  }
)
