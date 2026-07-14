import type { Request, Response } from "express";
import { asyncHandler } from '../utils/globalErrorHandler.util.js';
import { successResponse } from '../utils/response.util.js';
import { collectionService } from "../services/collection.service.js";

export const createCollection = asyncHandler(async (req: Request, res: Response) => {
  const result = await collectionService.create(req.body);

  successResponse(res, {
    statusCode: 201,
    message: "Collection created successfully",
    data: result,
  });
});

export const getCollections = asyncHandler(async (req: Request, res: Response) => {
  const appearOnHome = req.query.appearOnHome === 'true' ? true : req.query.appearOnHome === 'false' ? false : undefined;
  const result = await collectionService.getAll(appearOnHome);

  successResponse(res, {
    message: "Collections fetched successfully",
    data: result,
  });
});

export const getCollection = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await collectionService.getById(id);

  successResponse(res, {
    message: "Collection fetched successfully",
    data: result,
  });
});

export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const result = await collectionService.update(id, req.body);

  successResponse(res, {
    message: "Collection updated successfully",
    data: result,
  });
});

export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await collectionService.delete(id);

  successResponse(res, {
    message: "Collection deleted successfully",
  });
});
