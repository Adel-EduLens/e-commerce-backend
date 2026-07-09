import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { productService } from "../services/product.service.js";

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
    limit: Number(req.query.limit) || 16,
    traderId: req.query.traderId ? Number(req.query.traderId) : undefined,
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

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await productService.getProductDetails(id, req.user ? Number(req.user.id) : undefined);

  successResponse(res, {
    message: "Product fetched successfully",
    data: result,
  });
});

export const getProductRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await productService.getProductRecommended(id);

  successResponse(res, {
    message: "Recommended products fetched successfully",
    data: result,
  });
});

export const getProductReviewsPage = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const queryObj: any = {};
  if (req.query.page) queryObj.page = Number(req.query.page);
  if (req.query.limit) queryObj.limit = Number(req.query.limit);
  if (req.query.rating) queryObj.rating = Number(req.query.rating);
  if (req.query.sort) queryObj.sort = req.query.sort as string;

  const result = await productService.getProductReviews(id, queryObj);

  successResponse(res, {
    message: "Reviews fetched successfully",
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
