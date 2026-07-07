import type { Response } from 'express'
import { adminRepository } from '../repositories/admin.repository.js'
import type { AdminAuthenticatedRequest } from '../types/admin.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import AppError from '../utils/AppError.util.js'

export const getAllUsers = asyncHandler(
  async (req: AdminAuthenticatedRequest, res: Response) => {
    const result = await adminRepository.getAllUsers()

    successResponse(res, {
      statusCode: 200,
      message: 'Users fetched successfully',
      data: result,
    })
  }
)

export const changeStatus = asyncHandler(
  async (req: AdminAuthenticatedRequest, res: Response) => {
    const userId = Number(req.params.id)
    if (isNaN(userId)) throw new AppError('Invalid user ID', 400)
    const { status } = req.body
    const result = await adminRepository.changeStatus(userId, status)
    successResponse(res, {
      statusCode: 200,
      message: 'User status updated successfully',
      data: result,
    })
  }
)
