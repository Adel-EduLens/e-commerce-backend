import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { reviewService } from "../services/review.service.js";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.create({
    ...req.body,
    userId: Number(req.user!.id),
  });

  successResponse(res, {
    statusCode: 201,
    message: "Review created successfully",
    data: result,
  });
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const productId = String(req.params.productId);

  const result = await reviewService.getByProduct(productId);

  successResponse(res, {
    message: "Reviews fetched successfully",
    data: result,
  });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const result = await reviewService.update(id, {
    ...req.body,
    userId: Number(req.user!.id),
  });

  successResponse(res, {
    message: "Review updated successfully",
    data: result,
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  await reviewService.delete(id, Number(req.user!.id));

  successResponse(res, {
    message: "Review deleted successfully",
  });
});