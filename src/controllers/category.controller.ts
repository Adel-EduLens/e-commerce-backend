import type { Request, Response } from "express";
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import { categoryService } from "../services/category.service.js";

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.create(req.body);

  successResponse(res, {
    statusCode: 201,
    message: "Category created successfully",
    data: result,
  });
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  if (req.query.all === 'true') {
    const result = await categoryService.getAll();

    return successResponse(res, {
      message: "Categories fetched successfully",
      data: result,
    });
  }

  const result = await categoryService.getAll({
    isWholesale: req.query.isWholesale === 'true',
    isRetail: req.query.isRetail === 'true',
  });

  successResponse(res, {
    message: "Categories fetched successfully",
    data: result,
  });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await categoryService.getById(id);

  successResponse(res, {
    message: "Category fetched successfully",
    data: result,
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await categoryService.update(id, req.body);

  successResponse(res, {
    message: "Category updated successfully",
    data: result,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await categoryService.delete(id);

  successResponse(res, {
    message: "Category deleted successfully",
  });
});
