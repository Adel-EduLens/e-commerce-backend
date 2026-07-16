import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { influencerAuthService } from "../services/influencer.auth.service.js";
import { influencerRepository } from "../repositories/influencer.repository.js";
import AppError from "../utils/AppError.util.js";

export const influencerLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await influencerAuthService.login(req.body);
  successResponse(res, {
    statusCode: 200,
    message: "Influencer logged in successfully",
    data: result,
  });
});

export const getInfluencerMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "influencer") {
    throw new AppError("Not authenticated", 401);
  }

  const influencer = await influencerRepository.findById(Number(req.user.id), {
    id: true,
    name: true,
    email: true,
    phone: true,
    status: true,
    role: true,
    createdAt: true,
  });

  if (!influencer) {
    throw new AppError("Influencer not found", 404);
  }

  successResponse(res, {
    statusCode: 200,
    data: { influencer },
  });
});
