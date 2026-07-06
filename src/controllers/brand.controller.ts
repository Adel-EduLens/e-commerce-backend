import { Request, Response } from "express";
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import { brandService } from "../services/brand.service.js";

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const result =await brandService.getAll();
  successResponse(res, {
    message: "brands fetched successfully",
    data: result,
  });
});
export const createBrand = asyncHandler(async (req: Request, res: Response) => {
    const result = await brandService.create({ ...req.body });
    successResponse(res, {
        message: "Brand created successfully",
        data: result,
    });
});