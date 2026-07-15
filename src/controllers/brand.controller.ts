import { Request, Response } from "express";
import { retailBrandService } from "../services/retailBrand.service.js";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";

export const createRetailBrand = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const brand = await retailBrandService.create(name);

  successResponse(res, {
    message: "Brand created successfully",
    data: brand,
  });
});

export const getRetailBrands = asyncHandler(async (_req: Request, res: Response) => {
  const brands = await retailBrandService.getAll();

  successResponse(res, {
    message: "Brands fetched successfully",
    data: brands,
  });
});

export const getRetailBrandById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const brand = await retailBrandService.getById(id);

  successResponse(res, {
    message: "Brand fetched successfully",
    data: brand,
  });
});

export const updateRetailBrand = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const brand = await retailBrandService.update(id, req.body.name);

  successResponse(res, {
    message: "Brand updated successfully",
    data: brand,
  });
});

export const deleteRetailBrand = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await retailBrandService.delete(id);

  successResponse(res, {
    message: "Brand deleted successfully",
  });
});

export const getMyRetailBrands = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const brands = await retailBrandService.getTraderBrands(traderId);

  successResponse(res, {
    message: "Trader brands fetched successfully",
    data: brands,
  });
});