import type { Request, Response } from "express";
import { successResponse } from "../utils/response.util.js";
import AppError from "../utils/AppError.util.js";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";

const createUploadHandler = (folder: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("Image is required", 400);
    }

    const url = `${req.protocol}://${req.get("host")}/uploads/${folder}/${req.file.filename}`;

    successResponse(res, {
      statusCode: 200,
      message: "Image uploaded successfully",
      data: { url },
    });
  });

export const uploadBlankProductImage = createUploadHandler("blank-products");
export const uploadCategoryImage = createUploadHandler("categories");
export const uploadRetailCategoryImage = createUploadHandler("retail-categories");
export const uploadRetailProductImage = createUploadHandler("retail-products");
export const uploadProductImage = createUploadHandler("products");