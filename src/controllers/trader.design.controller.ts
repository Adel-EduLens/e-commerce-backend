import type { Request, Response } from "express";
import { successResponse } from "../utils/response.util.js";
import AppError from "../utils/AppError.util.js";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { traderDesignService } from "../services/trader.design.service.js";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("Image is required", 400);
  }
  const result = await traderDesignService.uploadImage(req.file, req);
  successResponse(res, {
    statusCode: 200,
    message: "Image uploaded successfully",
    data: result,
  });
});

export const getImages = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 16;
  const result = await traderDesignService.getImages(page, limit);
  successResponse(res, {
    statusCode: 200,
    message: "Images fetched successfully",
    data: result,
  });
});

export const vote = asyncHandler(async (req: Request, res: Response) => {
  const result = await traderDesignService.vote(req.params.id as string);
  successResponse(res, {
    statusCode: 200,
    message: "Image voted successfully",
    data: result,
  });
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const result = await traderDesignService.deleteImage(req.params.id as string);
  successResponse(res, {
    statusCode: 200,
    message: "Image deleted successfully",
    data: result,
  });
});
