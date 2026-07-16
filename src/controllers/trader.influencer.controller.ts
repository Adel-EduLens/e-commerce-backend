import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { influencerService } from "../services/influencer.service.js";
import { influencerSettlementService } from "../services/influencer.settlement.service.js";

export const createInfluencer = asyncHandler(async (req: Request, res: Response) => {
  const result = await influencerService.create(req.body);
  successResponse(res, {
    statusCode: 201,
    message: "Influencer created successfully",
    data: result,
  });
});

export const getAllInfluencers = asyncHandler(async (req: Request, res: Response) => {
  const result = await influencerService.getAll();
  successResponse(res, {
    message: "Influencers fetched successfully",
    data: result,
  });
});

export const getInfluencerById = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await influencerService.getById(id);
  successResponse(res, {
    message: "Influencer fetched successfully",
    data: result,
  });
});

export const updateInfluencer = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await influencerService.update(id, req.body);
  successResponse(res, {
    message: "Influencer updated successfully",
    data: result,
  });
});

export const updateInfluencerCoupon = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await influencerService.updateCoupon(id, req.body);
  successResponse(res, {
    message: "Influencer coupon updated successfully",
    data: result,
  });
});

export const getInfluencerCommissions = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await influencerService.getCommissions(id);
  successResponse(res, {
    message: "Commissions fetched successfully",
    data: result,
  });
});

export const getInfluencerSettlements = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const result = await influencerService.getSettlements(id);
  successResponse(res, {
    message: "Settlements fetched successfully",
    data: result,
  });
});

export const getAllSettlements = asyncHandler(async (req: Request, res: Response) => {
  const result = await influencerService.getAllSettlements();
  successResponse(res, {
    message: "All settlements fetched successfully",
    data: result,
  });
});

export const generateSettlements = asyncHandler(async (req: Request, res: Response) => {
  const result = await influencerSettlementService.generateMonthlySettlements();
  successResponse(res, {
    message: "Settlements generated successfully",
    data: result,
  });
});

export const markSettlementPaid = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await influencerService.markSettlementPaid(id);
  successResponse(res, {
    message: "Settlement marked as paid",
    data: result,
  });
});
