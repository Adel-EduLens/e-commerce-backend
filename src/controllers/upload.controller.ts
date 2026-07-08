import type { Request, Response } from 'express'
import { successResponse } from '../utils/response.util.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { uploadService } from '../services/upload.service.js'

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image is required' })
  }
  const url = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`
  successResponse(res, {
    statusCode: 200,
    message: 'Image uploaded successfully',
    data: { url },
  })
})

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'Image is required',
    })
  }
  const result = await uploadService.uploadImage(req.file, req)
  successResponse(res, {
    statusCode: 200,
    message: 'Image uploaded successfully',
    data: result,
  })
})

export const getImages = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 16
  const result = await uploadService.getImages(page, limit)
  successResponse(res, {
    statusCode: 200,
    message: 'Images fetched successfully',
    data: result,
  })
})

export const vote = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.vote(req.params.id as string)
  successResponse(res, {
    statusCode: 200,
    message: 'Image voted successfully',
    data: result,
  })
})

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.deleteImage(req.params.id as string)
  successResponse(res, {
    statusCode: 200,
    message: 'Image deleted successfully',
    data: result,
  })
})
