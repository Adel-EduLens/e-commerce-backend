import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { RetailCategoryService } from "../services/retailCategory.service.js";

const retailCategoryService = new RetailCategoryService();

export const getAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await retailCategoryService.getAllCategories();

  successResponse(res, {
    statusCode: 200,
    message: "Categories fetched successfully",
    data: categories,
  });
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const category = await retailCategoryService.getCategoryById(id);

  successResponse(res, {
    statusCode: 200,
    message: "Category fetched successfully",
    data: category,
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, image, appearOnHome } = req.body;

  const category = await retailCategoryService.createCategory({
    name,
    image,
    appearOnHome,
  });

  successResponse(res, {
    statusCode: 201,
    message: "Category created successfully",
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { name, image, appearOnHome } = req.body;

  const category = await retailCategoryService.updateCategory(id, {
    name,
    image,
    appearOnHome,
  });

  successResponse(res, {
    statusCode: 200,
    message: "Category updated successfully",
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  await retailCategoryService.deleteCategory(id);

  successResponse(res, {
    statusCode: 200,
    message: "Category deleted successfully",
  });
});
