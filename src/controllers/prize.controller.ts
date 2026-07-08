import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { Request, Response } from "express";
import { prizeService } from "../services/prize.service.js";
import { successResponse } from "../utils/response.util.js";
import AppError from "../utils/AppError.util.js";



export const getPrizes = asyncHandler(async (req: Request, res: Response) => {
  const result = await prizeService.getPrizes();
  successResponse(res, {
    statusCode: 200,
    message: "Prizes retrieved successfully",
    data: result,
  });
});
export const addPrize = asyncHandler(async (req: Request, res: Response) => {
  const result = await prizeService.addPrize(req.body);
  successResponse(res, {
    statusCode: 200,
    message: "Prize Added successfully",
    data: result,
  });
});
export const deletePrize = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await prizeService.deletePrize(id?.toString()||"");

  successResponse(res, {
    statusCode: 200,
    message: "Prize Deleted successfully",
    data: result,
  });
});

export const spinPrize = asyncHandler(async (req: Request, res: Response) => {
  const result = await prizeService.spinPrize();
  successResponse(res, {
    statusCode: 200,
    message: "Prize Spin successfully",
    data: result,
  });
});
