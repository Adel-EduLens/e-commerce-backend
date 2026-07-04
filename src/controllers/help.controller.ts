import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { helpService } from '../services/help.service.js'

export const getHelpIndex = asyncHandler(async (_req: Request, res: Response) => {
  const result = await helpService.getHelpSummary()

  successResponse(res, {
    statusCode: 200,
    message: 'Help content fetched successfully',
    data: result,
  })
})

export const getHelpCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await helpService.getCategories()

  successResponse(res, {
    statusCode: 200,
    message: 'Help categories fetched successfully',
    data: { categories: result },
  })
})

export const getHelpFaqs = asyncHandler(async (req: Request, res: Response) => {
  const result = await helpService.getFaqs(req.query)

  successResponse(res, {
    statusCode: 200,
    message: 'FAQs fetched successfully',
    data: result,
  })
})

export const getHelpFaqById = asyncHandler(async (req: Request, res: Response) => {
  const result = await helpService.getFaqById(Number(req.params.id))

  successResponse(res, {
    statusCode: 200,
    message: 'FAQ fetched successfully',
    data: result,
  })
})
