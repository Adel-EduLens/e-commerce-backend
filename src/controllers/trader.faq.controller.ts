import type { Request, Response } from 'express'
import { traderFAQService } from '../services/trader.faq.service.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import AppError from '../utils/AppError.util.js'

export const addFAQ = asyncHandler(async (req: Request, res: Response) => {
  const { question, answer } = req.body as {
    question: string
    answer: string
  }

  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new AppError('Question field is required and must be a valid string', 400)
  }
  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    throw new AppError('Answer field is required and must be a valid string', 400)
  }

  const result = await traderFAQService.createFAQ(question, answer)

  successResponse(res, {
    statusCode: 201,
    message: 'Question added successfully',
    data: result,
  })
})

export const getFAQs = asyncHandler(async (_req: Request, res: Response) => {
  const result = await traderFAQService.getFAQs()

  successResponse(res, {
    statusCode: 200,
    message: 'Questions fetched successfully',
    data: result,
  })
})

export const getPublicFAQs = asyncHandler(async (_req: Request, res: Response) => {
  const result = await traderFAQService.getFAQs()

  successResponse(res, {
    statusCode: 200,
    message: 'Questions fetched successfully',
    data: result,
  })
})

export const deleteFAQ = asyncHandler(async (req: Request, res: Response) => {
  const questionId = Number(req.params.id)
  if (isNaN(questionId)) throw new AppError('Invalid question ID', 400)
  const result = await traderFAQService.deleteFAQ(questionId)

  successResponse(res, {
    statusCode: 200,
    message: 'Question deleted successfully',
    data: result,
  })
})

export const updateFAQ = asyncHandler(async (req: Request, res: Response) => {
  const questionId = Number(req.params.id)
  if (isNaN(questionId)) throw new AppError('Invalid question ID', 400)
  const { question, answer } = req.body as {
    question: string
    answer: string
  }

  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new AppError('Question field is required and must be a valid string', 400)
  }
  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    throw new AppError('Answer field is required and must be a valid string', 400)
  }

  const result = await traderFAQService.updateFAQ(questionId, question, answer)

  successResponse(res, {
    statusCode: 200,
    message: 'Question updated successfully',
    data: result,
  })
})
