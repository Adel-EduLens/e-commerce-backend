import type { Request, Response } from 'express'
import { adminRepository } from '../repositories/admin.repository.js'
import { adminAuthService } from '../services/admin.auth.service.js'
import type { AdminAuthenticatedRequest } from '../types/admin.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import AppError from '../utils/AppError.util.js'

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminAuthService.login(req.body)
  successResponse(res, {
    statusCode: 200,
    message: 'Admin logged in successfully',
    data: result,
  })
})

export const getAdminMe = asyncHandler(
  async (req: AdminAuthenticatedRequest, res: Response) => {
    successResponse(res, {
      statusCode: 200,
      data: { admin: req.admin },
    })
  }
)


