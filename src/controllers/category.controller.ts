import type { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { categoryService } from "../services/category.service.js";

function parseBool(val: unknown): boolean | undefined {
  if (val === "true") return true;
  if (val === "false") return false;
  return undefined;
}

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await categoryService.create(req.body);
    successResponse(res, {
      statusCode: 201,
      message: "Category created successfully",
      data: result,
    });
  }
);

export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    let isWholesale = parseBool(req.query.isWholesale);
    let isRetail = parseBool(req.query.isRetail);
    let isShop = parseBool(req.query.isShop);

    // Keep backwards compatibility with ?type=WHOLESALE or ?type=RETAIL or ?type=SHOP if they are passed
    if (req.query.type === "WHOLESALE") isWholesale = true;
    if (req.query.type === "RETAIL") isRetail = true;
    if (req.query.type === "SHOP") isShop = true;

    const filters: {
      isWholesale?: boolean;
      isRetail?: boolean;
      isShop?: boolean;
    } = {};

    if (isWholesale !== undefined) filters.isWholesale = isWholesale;
    if (isRetail !== undefined) filters.isRetail = isRetail;
    if (isShop !== undefined) filters.isShop = isShop;

    const result = await categoryService.getAll(filters);
    successResponse(res, {
      message: "Categories fetched successfully",
      data: result,
    });
  }
);



export const getCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await categoryService.getById(id);
    successResponse(res, {
      message: "Category fetched successfully",
      data: result,
    });
  }
);


export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await categoryService.update(id, req.body);
    successResponse(res, {
      message: "Category updated successfully",
      data: result,
    });
  }
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await categoryService.delete(id);
    successResponse(res, { message: "Category deleted successfully" });
  }
);
