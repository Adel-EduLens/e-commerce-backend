import type { Request, Response } from 'express'
import { traderRepository } from '../repositories/trader.repository.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'

export const addVideo = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, category, youtubeId } = req.body as {
      title: string
      category: string
      youtubeId: string
    }
    const result = await traderRepository.addvideo(title, category, youtubeId)

    successResponse(res, {
      statusCode: 201,
      message: 'Video added successfully',
      data: result,
    })
  }
)

export const getVideos = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await traderRepository.getVideos()

    successResponse(res, {
      statusCode: 200,
      message: 'Videos fetched successfully',
      data: result,
    })
  }
)

export const updateVideo = asyncHandler(
  async (req: Request, res: Response) => {
    const videoId = req.params.id as string
    const { title, category, youtubeId } = req.body as {
      title: string
      category: string
      youtubeId: string
    }
    const result = await traderRepository.updateVideo(
      videoId,
      title,
      category,
      youtubeId
    )

    successResponse(res, {
      statusCode: 200,
      message: 'Video updated successfully',
      data: result,
    })
  }
)

export const deleteVideo = asyncHandler(
  async (req: Request, res: Response) => {
    const videoId = req.params.id as string
    const result = await traderRepository.deleteVideo(videoId)

    successResponse(res, {
      statusCode: 200,
      message: 'Video deleted successfully',
      data: result,
    })
  }
)

export const addHelpCenterCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name } = req.body as { name: string }
    const result = await traderRepository.addHelpCenterCategory(name)

    successResponse(res, {
      statusCode: 201,
      message: 'Category added successfully',
      data: result,
    })
  }
)

export const getHelpCenterCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await traderRepository.getHelpCenterCategories()

    successResponse(res, {
      statusCode: 200,
      message: 'Categories fetched successfully',
      data: result,
    })
  }
)

export const deleteHelpCenterCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = req.params.id as string
    const result = await traderRepository.deleteHelpCenterCategory(categoryId)

    successResponse(res, {
      statusCode: 200,
      message: 'Category deleted successfully',
      data: result,
    })
  }
)
