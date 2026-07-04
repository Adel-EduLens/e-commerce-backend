import type { Request, Response } from 'express'
import { adminRepository } from '../repositories/admin.repository.js'
import { adminAuthService } from '../services/admin.auth.service.js'
import type { AdminAuthenticatedRequest } from '../types/admin.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'

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
    const result = await adminRepository.deleteQuestion(questionId)

    successResponse(res, {
      statusCode: 200,
      message: 'Question deleted successfully',
      data: result,
    })
  }
)

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
    const { status } = req.body as { status: 'active' | 'suspended' }
    const result = await adminRepository.changeStatus(userId, status)
    successResponse(res, {
      statusCode: 200,
      message: 'User status updated successfully',
      data: result,
    })
  }
)

export const updateQuestion = asyncHandler(
  async (req: AdminAuthenticatedRequest, res: Response) => {
    const questionId = Number(req.params.id)
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
