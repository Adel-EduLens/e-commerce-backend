import type { Request, Response } from "express";
import { successResponse } from "../utils/response.util.js";
import AppError from "../utils/AppError.util.js";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { uploadService } from "../services/upload.service.js";

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

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("Image is required", 400);
  }
  const result = await uploadService.uploadImage(req.file, req);
  successResponse(res, {
    statusCode: 200,
    message: "Image uploaded successfully",
    data: result,
  });
});

export const getImages = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 16;
  const result = await uploadService.getImages(page, limit);
  successResponse(res, {
    statusCode: 200,
    message: "Images fetched successfully",
    data: result,
  });
});

export const vote = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.vote(req.params.id as string);
  successResponse(res, {
    statusCode: 200,
    message: "Image voted successfully",
    data: result,
  });
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const result = await uploadService.deleteImage(req.params.id as string);
  successResponse(res, {
    statusCode: 200,
    message: "Image deleted successfully",
    data: result,
  });
});
