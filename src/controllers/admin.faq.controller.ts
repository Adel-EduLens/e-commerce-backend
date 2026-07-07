import type { Request, Response } from 'express'
import { adminRepository } from '../repositories/admin.repository.js'
import type { AdminAuthenticatedRequest } from '../types/admin.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import AppError from '../utils/AppError.util.js'

export const addQuestion = asyncHandler(
  async (req: AdminAuthenticatedRequest, res: Response) => {
    const { question, answer } = req.body as {
      question: string
      answer: string
    }
    const result = await adminRepository.addQuestion(question, answer)

    successResponse(res, {
      statusCode: 201,
      message: 'Question added successfully',
      data: result,
    })
  }
)

export const getQuestions = asyncHandler(
  async (_req: AdminAuthenticatedRequest, res: Response) => {
    const result = await adminRepository.getQuestions()

    successResponse(res, {
      statusCode: 200,
      message: 'Questions fetched successfully',
      data: result,
    })
  }
)

export const getPublicQuestions = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await adminRepository.getQuestions()

    successResponse(res, {
      statusCode: 200,
      message: 'Questions fetched successfully',
      data: result,
    })
  }
)

export const deleteQuestion = asyncHandler(
  async (req: AdminAuthenticatedRequest, res: Response) => {
    const questionId = Number(req.params.id)
    if (isNaN(questionId)) throw new AppError('Invalid question ID', 400)
    const result = await adminRepository.deleteQuestion(questionId)

    successResponse(res, {
      statusCode: 200,
      message: 'Question deleted successfully',
      data: result,
    })
  }
)

export const updateQuestion = asyncHandler(
  async (req: AdminAuthenticatedRequest, res: Response) => {
    const questionId = Number(req.params.id)
    if (isNaN(questionId)) throw new AppError('Invalid question ID', 400)
    const { question, answer } = req.body as {
      question: string
      answer: string
    }
    const result = await adminRepository.updateQuestion(
      questionId,
      question,
      answer
    )

    successResponse(res, {
      statusCode: 200,
      message: 'Question updated successfully',
      data: result,
    })
  }
)
