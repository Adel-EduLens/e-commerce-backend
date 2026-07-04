import type { Response } from 'express'
import type { AuthenticatedRequest } from '../types/user.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { userSettingsService } from '../services/userSettings.service.js'

export const getSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await userSettingsService.getSettings(Number(req.user?.id))

  successResponse(res, {
    statusCode: 200,
    message: 'Settings fetched successfully',
    data: result,
  })
})

export const updateSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await userSettingsService.updateSettings(Number(req.user?.id), req.body)

  successResponse(res, {
    statusCode: 200,
    message: 'Settings updated successfully',
    data: result,
  })
})
