import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import type { Request, Response } from "express";
import { prizeService } from "../services/prize.service.js";
import { successResponse } from "../utils/response.util.js";

export const getPrizes = asyncHandler(async (req: Request, res: Response) => {
  const result = await prizeService.getPrizes();
  successResponse(res, {
    statusCode: 200,
    message: "Prizes retrieved successfully",
    data: result,
  });
});
