import type { Request, Response } from "express";

import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";

import { retailProductService } from "../services/retailProduct.service.js";

const DEFAULT_PAGE_LIMIT = 16;
const DEFAULT_RECOMMENDATION_LIMIT = 4;

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await retailProductService.create({
      ...req.body,
      traderId: Number(req.user!.id),
    });

    successResponse(res, {
      statusCode: 201,
      message: "Retail product created successfully",
      data: result,
    });
  },
);

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await retailProductService.getAll({
    search: typeof req.query.search === "string" ? req.query.search : undefined,

    categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,

    brandId:
      typeof req.query.brandId === "string" ? req.query.brandId : undefined,

    filter: typeof req.query.filter === "string" ? req.query.filter : undefined,

    size: typeof req.query.size === "string" ? req.query.size : undefined,

    color: typeof req.query.color === "string" ? req.query.color : undefined,

    priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,

    priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,

    sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,

    sortOrder:
      req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
        ? req.query.sortOrder
        : undefined,

    page: Number(req.query.page) || 1,

    limit: Number(req.query.limit) || DEFAULT_PAGE_LIMIT,

    traderId: req.query.traderId ? Number(req.query.traderId) : undefined,
  });
  successResponse(res, {
    message: "Retail products fetched successfully",
    data: result,
  });
});

export const getRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    let categories: string[] | undefined;

    if (typeof req.query.categories === "string") {
      categories = req.query.categories
        .split(",")
        .filter(Boolean);
    } else if (Array.isArray(req.query.categories)) {
      categories = (req.query.categories as string[])
        .filter(Boolean);
    }

    const result = await retailProductService.getRecommendations({
      categories,

      limit: Number(req.query.limit) || DEFAULT_RECOMMENDATION_LIMIT,

      excludeId:
        typeof req.query.excludeId === "string"
          ? Number(req.query.excludeId)
          : undefined,

      categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,

      size: typeof req.query.size === "string" ? req.query.size : undefined,

      color: typeof req.query.color === "string" ? req.query.color : undefined,

      sortBy:
        typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,

      sortOrder:
        req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
          ? req.query.sortOrder
          : undefined,
    });

    successResponse(res, {
      message: "Recommendations fetched successfully",
      data: result,
    });
  },
);

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const result = await retailProductService.getById(id);

  successResponse(res, {
    message: "Retail product fetched successfully",
    data: result,
  });
});

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const result = await retailProductService.update(id, {
      ...req.body,
      traderId: Number(req.user!.id),
    });

    successResponse(res, {
      message: "Retail product updated successfully",
      data: result,
    });
  },
);

export const getTraderProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);

    const result = await retailProductService.getByTraderId(traderId);

    successResponse(res, {
      message: "Trader products fetched successfully",
      data: result,
    });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    await retailProductService.delete(id, Number(req.user!.id));

    successResponse(res, {
      message: "Retail product deleted successfully",
    });
  },
);
