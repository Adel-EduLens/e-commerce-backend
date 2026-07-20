import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { wholesaleService } from "../services/wholesale.service.js";
import prisma from "../utils/prismaClient.js";
import AppError from "../utils/AppError.util.js";

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

export const addWholesaleColor = asyncHandler(async (req: Request, res: Response) => {
  const wholesaleId = String(req.params.id);
  const { color, stock, minOrder, sizes } = req.body;

  if (!color) {
    throw new AppError("Color name is required", 400);
  }

  const traderId = Number(req.user!.id);
  const wholesale = await prisma.wholesale.findUnique({
    where: { id: wholesaleId },
  });

  if (!wholesale) {
    throw new AppError("Wholesale product not found", 404);
  }

  if (wholesale.traderId !== traderId) {
    throw new AppError("Unauthorized: You do not own this wholesale product", 403);
  }

  const newColor = await prisma.wholesaleColor.create({
    data: {
      color,
      stock: stock ? parseInt(stock, 10) : 0,
      minOrder: minOrder ? parseInt(minOrder, 10) : 1,
      wholesaleId,
      sizes: {
        create: sizes ? sizes.map((sz: string) => ({ size: sz })) : [],
      },
    },
    include: {
      sizes: true,
    },
  });

  const allColors = await prisma.wholesaleColor.findMany({
    where: { wholesaleId }
  });
  const newGlobalStock = allColors.reduce((sum, c) => sum + c.stock, 0);

  await prisma.wholesale.update({
    where: { id: wholesaleId },
    data: { stock: newGlobalStock },
  });

  successResponse(res, {
    message: "Color added to wholesale product successfully",
    data: newColor,
  });
});
