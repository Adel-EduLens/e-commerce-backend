import { Request, Response } from "express";
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import { productService } from "../services/product.service.js";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.create({ ...req.body, traderId: Number(req.user!.id) });
    successResponse(res, {
        statusCode: 201,
        message: "Product created successfully",
        data: result,
    });
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAll({
    search: req.query.search as string,
    categoryId: req.query.categoryId as string,
      brandId: req.query.brandId as string,
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

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await productService.getById(id);

    successResponse(res, {
        message: "Product fetched successfully",
        data: result,
    });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await productService.update(id, { ...req.body, traderId: Number(req.user!.id) });

    successResponse(res, {
        message: "Product updated successfully",
        data: result,
    });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await productService.delete(id,Number(req.user!.id));

    successResponse(res, {
        message: "Product deleted successfully",
    });
});