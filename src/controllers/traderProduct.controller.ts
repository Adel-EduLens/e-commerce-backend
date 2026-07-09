import type { Request, Response } from "express";
import { traderProductService } from "../services/traderProduct.service.js";
import { successResponse, errorResponse } from "../utils/response.util.js";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import AppError from "../utils/AppError.util.js";

// Helper to construct image URL
const getUploadUrl = (req: Request, filename: string) => {
  return `${req.protocol}://${req.get("host")}/uploads/products/${filename}`;
};

export const createTraderProduct = asyncHandler(async (req: Request, res: Response) => {
  const { name, title, description, price, categoryId, brandId, sizeguide, isMustHave, isFlashDeals, flashDealPrice, flashDealEndsAt, sku, stock } = req.body;
  const traderId = Number(req.user?.id);

  if (!traderId) {
    throw new AppError("Unauthorized: Trader ID is required", 401);
  }

  // 1. Parse colors JSON
  let colorsList: any[] = [];
  if (req.body.colors) {
    try {
      colorsList = typeof req.body.colors === "string" ? JSON.parse(req.body.colors) : req.body.colors;
    } catch (e) {
      throw new AppError("Invalid JSON format for colors", 400);
    }
  }

  // 2. Extract uploaded files from req.files
  const files = (req.files as Express.Multer.File[]) || [];

  // 3. Map uploaded files to each color variant
  const colorsData = colorsList.map((color: any) => {
    const fieldName = `images_${color.name}`;
    const colorFiles = files.filter((f) => f.fieldname === fieldName);

    const images = colorFiles.map((file, idx) => ({
      imageUrl: getUploadUrl(req, file.filename),
      isPrimary: idx === 0,
    }));

    return {
      colorName: color.name,
      colorCode: color.code || null,
      images,
      variants: (color.sizes || []).map((s: any) => ({
        size: s.size,
        quantity: Number(s.quantity),
        sku: s.sku || null,
      })),
    };
  });

  // 4. Create product
  const payload: any = {
    name: name || title,
    description: description || undefined,
    price: Number(price),
    brandId: brandId || undefined,
    categoryId,
    traderId,
    sizeguide: sizeguide || undefined,
    isMustHave: isMustHave === "true" || isMustHave === true,
    isFlashDeals: isFlashDeals === "true" || isFlashDeals === true,
    colors: colorsData,
  };

  if (flashDealPrice !== undefined) payload.flashDealPrice = Number(flashDealPrice);
  if (flashDealEndsAt !== undefined) payload.flashDealEndsAt = flashDealEndsAt;
  if (sku !== undefined) payload.sku = sku;
  if (stock !== undefined) payload.stock = Number(stock);

  const product = await traderProductService.create(payload);

  return successResponse(res, {
    statusCode: 201,
    message: "Product created successfully",
    data: product,
  });
});

export const getTraderProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await traderProductService.getById(req.params.id as string);
  return successResponse(res, {
    statusCode: 200,
    message: "Product fetched successfully",
    data: product,
  });
});

export const deleteTraderProduct = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  await traderProductService.delete(req.params.id as string, traderId);
  return successResponse(res, {
    statusCode: 200,
    message: "Product deleted successfully",
  });
});

// ─── Update Controllers ──────────────────────────────────────────────────────

export const addTraderProductColor = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const productId = req.params.productId as string;
  const { colorName, colorCode } = req.body;

  let variants = [];
  if (req.body.variants) {
    try {
      variants = typeof req.body.variants === "string" ? JSON.parse(req.body.variants) : req.body.variants;
    } catch (e) {
      throw new AppError("Invalid JSON for variants", 400);
    }
  }

  const files = (req.files as Express.Multer.File[]) || [];
  const images = files.map((file, idx) => ({
    imageUrl: getUploadUrl(req, file.filename),
    isPrimary: idx === 0,
  }));

  if (images.length === 0) {
    throw new AppError("At least one image is required for the new color", 400);
  }

  const color = await traderProductService.addColor(productId, traderId, {
    colorName,
    colorCode,
    images,
    variants: variants.map((v: any) => ({
      size: v.size,
      quantity: Number(v.quantity),
      sku: v.sku,
    })),
  });

  return successResponse(res, {
    statusCode: 201,
    message: "Color added successfully",
    data: color,
  });
});

export const deleteTraderProductColor = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const colorId = req.params.colorId as string;
  await traderProductService.deleteColor(colorId, traderId);
  return successResponse(res, {
    statusCode: 200,
    message: "Color deleted successfully",
  });
});

export const replaceTraderProductColorImages = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const colorId = req.params.colorId as string;

  const files = (req.files as Express.Multer.File[]) || [];
  const images = files.map((file, idx) => ({
    imageUrl: getUploadUrl(req, file.filename),
    isPrimary: idx === 0,
  }));

  if (images.length === 0) {
    throw new AppError("At least one image is required", 400);
  }

  const result = await traderProductService.replaceColorImages(colorId, traderId, images);
  return successResponse(res, {
    statusCode: 200,
    message: "Color images replaced successfully",
    data: result,
  });
});

export const addTraderProductColorImages = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const colorId = req.params.colorId as string;

  const files = (req.files as Express.Multer.File[]) || [];
  const images = files.map((file) => ({
    imageUrl: getUploadUrl(req, file.filename),
    isPrimary: false,
  }));

  if (images.length === 0) {
    throw new AppError("At least one image file is required", 400);
  }

  const result = await traderProductService.addImages(colorId, traderId, images);
  return successResponse(res, {
    statusCode: 201,
    message: "Images added successfully",
    data: result,
  });
});

export const deleteTraderProductImage = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const imageId = req.params.imageId as string;
  await traderProductService.deleteImage(imageId, traderId);
  return successResponse(res, {
    statusCode: 200,
    message: "Image deleted successfully",
  });
});

export const updateTraderProductSizeQuantity = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const variantId = req.params.variantId as string;
  const { quantity } = req.body;

  if (quantity === undefined) {
    throw new AppError("Quantity is required", 400);
  }

  const result = await traderProductService.updateSizeQuantity(variantId, traderId, Number(quantity));
  return successResponse(res, {
    statusCode: 200,
    message: "Size quantity updated successfully",
    data: result,
  });
});

export const addTraderProductSize = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const colorId = req.params.colorId as string;
  const { size, quantity, sku } = req.body;

  if (!size || quantity === undefined) {
    throw new AppError("Size and quantity are required", 400);
  }

  const result = await traderProductService.addSize(colorId, traderId, size, Number(quantity), sku);
  return successResponse(res, {
    statusCode: 201,
    message: "Size variant added successfully",
    data: result,
  });
});

export const deleteTraderProductSize = asyncHandler(async (req: Request, res: Response) => {
  const traderId = Number(req.user?.id);
  const variantId = req.params.variantId as string;
  await traderProductService.deleteSize(variantId, traderId);
  return successResponse(res, {
    statusCode: 200,
    message: "Size variant deleted successfully",
  });
});
