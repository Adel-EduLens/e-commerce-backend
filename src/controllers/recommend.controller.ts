import type { Request, Response, NextFunction } from 'express'
import { recommendService } from '../services/recommend.service.js'
import { successResponse } from '../utils/response.util.js'
import AppError from '../utils/AppError.util.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'

export const addSignal = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number(req.user!.id)
    const { productId, categoryId, type } = req.body as {
      productId?: string
      categoryId?: string
      type?: string
    }

    if (!productId || !categoryId || !type) {
      return next(new AppError('productId, categoryId, and type are required', 400))
    }

    if (type !== 'view' && type !== 'purchase') {
      return next(new AppError('type must be either "view" or "purchase"', 400))
    }

    const result = await recommendService.addSignal(userId, productId, categoryId, type)

    successResponse(res, {
      statusCode: 201,
      message: 'Signal recorded successfully',
      data: result,
    })
  }
)

export const getSignals = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user!.id)
    const result = await recommendService.getSignals(userId)

    successResponse(res, {
      statusCode: 200,
      message: 'Signals fetched successfully',
      data: result,
    })
  }
)

export const getTopCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user!.id)
    const limit = req.query.limit ? Number(req.query.limit) : 3
    const result = await recommendService.getTopCategories(userId, limit)

    successResponse(res, {
      statusCode: 200,
      message: 'Top categories fetched successfully',
      data: result,
    })
  }
)

export const clearSignals = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.user!.id)
    await recommendService.clearSignals(userId)

    successResponse(res, {
      statusCode: 200,
      message: 'Signals cleared successfully',
      data: { success: true },
    })
  }
)
