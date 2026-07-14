import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { shopBannerService } from "../services/shopBanner.service.js";

export const createShopBanner = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await shopBannerService.create(req.body);

    successResponse(res, {
      statusCode: 201,

      message: "Shop banner created successfully",

      data: result,
    });
  },
);

export const getShopBanners = asyncHandler(async (req, res) => {
  const type = req.query.type ? String(req.query.type) : undefined;
  const result = await shopBannerService.getAll(type);

  successResponse(res, {
    message: "Shop banners fetched successfully",

    data: result,
  });
});

export const getActiveShopBanners = asyncHandler(async (req, res) => {
  const type = req.query.type ? String(req.query.type) : undefined;
  const result = await shopBannerService.getActive(type);

  successResponse(res, {
    message: "Active shop banners fetched successfully",

    data: result,
  });
});

export const getShopBanner = asyncHandler(async (req, res) => {
  const result = await shopBannerService.getById(String(req.params.id));

  successResponse(res, {
    message: "Shop banner fetched successfully",

    data: result,
  });
});

export const updateShopBanner = asyncHandler(async (req, res) => {
  const result = await shopBannerService.update(
    String(req.params.id),
    req.body,
  );

  successResponse(res, {
    message: "Shop banner updated successfully",

    data: result,
  });
});

export const deleteShopBanner = asyncHandler(async (req, res) => {
  await shopBannerService.delete(String(req.params.id));

  successResponse(res, {
    message: "Shop banner deleted successfully",
  });
});
