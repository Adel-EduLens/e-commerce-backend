import type { Request, Response } from "express";

import { asyncHandler } from "../utils/globalErrorHandler.util.js";

import { successResponse } from "../utils/response.util.js";

import { retailReviewService } from "../services/retailReview.service.js";

export const createRetailReview = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await retailReviewService.create({
      ...req.body,

      userId: Number(req.user!.id),
    });

    successResponse(res, {
      statusCode: 201,
      message: "Review created successfully",
      data: result,
    });
  },
);

export const getRetailProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const retailProductId = Number(req.params.productId);

    const result = await retailReviewService.getByProduct(retailProductId);

    successResponse(res, {
      message: "Reviews fetched successfully",
      data: result,
    });
  },
);

export const updateRetailReview = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const result = await retailReviewService.update(id, {
      ...req.body,
      userId: Number(req.user!.id),
    });

    successResponse(res, {
      message: "Review updated successfully",
      data: result,
    });
  },
);

export const deleteRetailReview = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    await retailReviewService.delete(id, Number(req.user!.id));

    successResponse(res, {
      message: "Review deleted successfully",
    });
  },
);
