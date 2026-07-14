import type { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { productService } from "../services/product.service.js";

const DEFAULT_PAGE_LIMIT = 16;
const DEFAULT_RECOMMENTATION_LIMIT = 4;

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.create({
      ...req.body,
      traderId: Number(req.user!.id),
    });
    successResponse(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: result,
    });
  },
);

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAll({
    search: req.query.search as string,
    categoryId: req.query.categoryId as string,
    brandId: req.query.brandId as string,
    filter: req.query.filter as string,
    size: req.query.size as string,
    color: req.query.color as string,
    priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
    priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as "asc" | "desc",
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || DEFAULT_PAGE_LIMIT,
    traderId: req.query.traderId ? Number(req.query.traderId) : undefined,
    collectionId: req.query.collectionId as string,
  });

  successResponse(res, {
    message: "Products fetched successfully",
    data: result,
  });
});

export const getFilters = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getFilters();

  successResponse(res, {
    message: "Filters fetched successfully",
    data: result,
  });
});

export const getRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    let categories: string[] | undefined;
    if (typeof req.query.categories === "string" && req.query.categories.trim() !== "") {
      categories = req.query.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    } else if (Array.isArray(req.query.categories)) {
      categories = (req.query.categories as string[])
        .map((c) => String(c).trim())
        .filter(Boolean);
    }

    const limit = Number(req.query.limit) || DEFAULT_RECOMMENTATION_LIMIT;
    const excludeId = typeof req.query.excludeId === "string" ? req.query.excludeId : undefined;
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const size = typeof req.query.size === "string" ? req.query.size : undefined;
    const color = typeof req.query.color === "string" ? req.query.color : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
    const sortOrder =
      req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
        ? req.query.sortOrder
        : undefined;

    const result = await productService.getRecommendations({
      categories,
      limit,
      excludeId,
      categoryId,
      size,
      color,
      sortBy,
      sortOrder,
    });

    successResponse(res, {
      message: "Recommendations fetched successfully",
      data: result,
    });
  },
);

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await productService.getById(id);

  successResponse(res, {
    message: "Product fetched successfully",
    data: result,
  });
});

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await productService.update(id, {
      ...req.body,
      traderId: Number(req.user!.id),
    });

    successResponse(res, {
      message: "Product updated successfully",
      data: result,
    });
  },
);

export const getTraderProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const result = await productService.getByTraderId(traderId);
    successResponse(res, {
      message: "Trader products fetched successfully",
      data: result,
    });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await productService.delete(id, Number(req.user!.id));

    successResponse(res, {
      message: "Product deleted successfully",
    });
  },
);
