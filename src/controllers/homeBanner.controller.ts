import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { homeBannerService } from "../services/homeBanner.service.js";

export const createHomeBanner = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await homeBannerService.create(req.body);
    res.status(201).json(result);
  },
);

export const getHomeBanners = asyncHandler(async (_req: Request, res: Response) => {
  const result = await homeBannerService.getAll();
  res.status(200).json(result);
});

export const getHomeBanner = asyncHandler(async (req: Request, res: Response) => {
  const result = await homeBannerService.getById(Number(req.params.id));
  res.status(200).json(result);
});

export const updateHomeBanner = asyncHandler(async (req: Request, res: Response) => {
  const result = await homeBannerService.update(
    Number(req.params.id),
    req.body,
  );
  res.status(200).json(result);
});

export const deleteHomeBanner = asyncHandler(async (req: Request, res: Response) => {
  await homeBannerService.delete(Number(req.params.id));
  res.status(204).end();
});
