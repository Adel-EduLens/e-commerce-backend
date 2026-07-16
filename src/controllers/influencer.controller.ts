import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { influencerService } from "../services/influencer.service.js";
import AppError from "../utils/AppError.util.js";

export const getInfluencerDashboard = asyncHandler(async (req: Request, res: Response) => {
  const influencerId = Number(req.user!.id);
  const result = await influencerService.getDashboard(influencerId);

  successResponse(res, {
    message: "Dashboard fetched successfully",
    data: result,
  });
});

export const getInfluencerCouponUsers = asyncHandler(async (req: Request, res: Response) => {
  const influencerId = Number(req.user!.id);
  const result = await influencerService.getCouponUsers(influencerId);

  successResponse(res, {
    message: "Coupon users fetched successfully",
    data: result,
  });
});

export const getInfluencerCommissions = asyncHandler(async (req: Request, res: Response) => {
  const influencerId = Number(req.user!.id);
  const result = await influencerService.getCommissions(influencerId);

  successResponse(res, {
    message: "Commissions fetched successfully",
    data: result,
  });
});

export const getInfluencerSettlements = asyncHandler(async (req: Request, res: Response) => {
  const influencerId = Number(req.user!.id);
  const result = await influencerService.getSettlements(influencerId);

  successResponse(res, {
    message: "Settlements fetched successfully",
    data: result,
  });
});
