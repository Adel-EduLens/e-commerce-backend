import type { Response } from 'express'
import type { AuthenticatedRequest } from '../types/user.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { accountService } from '../services/account.service.js'

export const getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await accountService.getDashboard(Number(req.user?.id))

  successResponse(res, {
    statusCode: 200,
    message: 'Dashboard fetched successfully',
    data: result,
  })
})

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await accountService.getProfile(Number(req.user?.id))

  successResponse(res, {
    statusCode: 200,
    message: 'Profile fetched successfully',
    data: result,
  })
})

export const updateMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await accountService.updateProfile(Number(req.user?.id), req.body)

  successResponse(res, {
    statusCode: 200,
    message: 'Profile updated successfully',
    data: result,
  })
})

export const signOut = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const result = await accountService.signOut()

  successResponse(res, {
    statusCode: 200,
    message: 'Signed out successfully',
    data: result,
  })
})
