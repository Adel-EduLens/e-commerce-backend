import type { Request, Response } from "express";
import { successResponse } from "../utils/response.util.js";
import AppError from "../utils/AppError.util.js";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";

export const uploadCategoryImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }
    const url = `${req.protocol}://${req.get("host")}/uploads/categories/${req.file.filename}`;
    successResponse(res, {
      statusCode: 200,
      message: "Image uploaded successfully",
      data: { url },
    });
  },
);
export const uploadRetailProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }
    const url = `${req.protocol}://${req.get("host")}/uploads/retail-products/${req.file.filename}`;
    successResponse(res, {
      statusCode: 200,
      message: "Image uploaded successfully",
      data: { url },
    });
  },
);
export const uploadRetailCategoryImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }
    const url = `${req.protocol}://${req.get("host")}/uploads/retail-categories/${req.file.filename}`;
    successResponse(res, {
      statusCode: 200,
      message: "Image uploaded successfully",
      data: { url },
    });
  },
);

export const uploadProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }
    const url = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
    successResponse(res, {
      statusCode: 200,
      message: "Image uploaded successfully",
      data: { url },
    });
  },
);
