import { Request, Response } from "express";

import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";

import { blankProductService } from "../services/blankProduct.service.js";

export const createBlankProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await blankProductService.create(req.body);

    successResponse(res, {
      statusCode: 201,
      message: "Blank product created successfully",
      data: result,
    });
  },
);

export const getBlankProducts = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await blankProductService.getAll();

    successResponse(res, {
      statusCode: 200,
      data: result,
    });
  },
);

export const getBlankProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await blankProductService.getOne(id?.toString() ?? "");

    successResponse(res, {
      statusCode: 200,
      data: result,
    });
  },
);

export const updateBlankProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await blankProductService.update(
      id?.toString() ?? "",
      req.body,
    );

    successResponse(res, {
      statusCode: 200,
      message: "Blank product updated successfully",
      data: result,
    });
  },
);

export const deleteBlankProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    await blankProductService.delete(id?.toString() ?? "");

    successResponse(res, {
      statusCode: 200,
      message: "Blank product deleted successfully",
    });
  },
);
