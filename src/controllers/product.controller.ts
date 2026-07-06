import { Request, Response } from "express";
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import AppError from '../utils/AppError.util.js';
import { successResponse } from '../utils/response.util.js';
import { productService } from "../services/product.service.js";
import type { AuthenticatedRequest } from '../types/user.type.js';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.create(req.body);

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
    const result = await productService.update(id, req.body);

    successResponse(res, {
        message: "Product updated successfully",
        data: result,
    });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    await productService.delete(id);

    successResponse(res, {
        message: "Product deleted successfully",
    });
});

export const rateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = Number(req.user?.id);
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const productId = String(req.params.id);
    const rating = Number(req.body.rating);

    const result = await productService.rateProduct(userId, productId, rating);

    successResponse(res, {
        message: "Product rating saved successfully",
        data: result,
    });
});