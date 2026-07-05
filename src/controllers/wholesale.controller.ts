import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { wholesaleService } from "../services/wholesale.service.js";

export const createWholesale = asyncHandler(async (req: Request, res: Response) => {
  const result = await wholesaleService.create({ ...req.body, traderId: Number(req.user!.id) });
  successResponse(res, {
    statusCode: 201,
    message: "Wholesale product created successfully",
    data: result,
  });
});

export const getWholesales = asyncHandler(async (req: Request, res: Response) => {
  const parseBool = (val: unknown) => val === 'true' ? true : val === 'false' ? false : undefined;
  const result = await wholesaleService.getAll({
    search: req.query.search as string,
    categoryId: req.query.categoryId as string,
    categoryName: req.query.category as string,
    isBestDeal: parseBool(req.query.isBestDeal),
    isMostPopular: parseBool(req.query.isMostPopular),
    isPremiumCollection: parseBool(req.query.isPremiumCollection),
  });

  successResponse(res, {
    message: "Wholesale products fetched successfully",
    data: result,
  });
});

export const getTraderWholesales = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user!.id);
  const result = await wholesaleService.getByTraderId(traderId);

  successResponse(res, {
    message: "Trader wholesale products fetched successfully",
    data: result,
  });
});

export const getWholesale = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await wholesaleService.getById(id);

  successResponse(res, {
    message: "Wholesale product fetched successfully",
    data: result,
  });
});

export const updateWholesale = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await wholesaleService.update(id, { ...req.body, traderId: Number(req.user!.id) });

  successResponse(res, {
    message: "Wholesale product updated successfully",
    data: result,
  });
});

export const deleteWholesale = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await wholesaleService.delete(id, Number(req.user!.id));

  successResponse(res, {
    message: "Wholesale product deleted successfully",
  });
});
