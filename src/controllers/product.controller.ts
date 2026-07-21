import type { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { productService } from "../services/product.service.js";
import { ProductType } from "@prisma/client";
import prisma from "../utils/prismaClient.js";
import AppError from "../utils/AppError.util.js";

const DEFAULT_PAGE_LIMIT = 16;
const DEFAULT_RECOMMENDATION_LIMIT = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────

function parseProductType(value: unknown): ProductType | undefined {
  const valid = Object.values(ProductType);
  if (typeof value === "string" && valid.includes(value as ProductType)) {
    return value as ProductType;
  }
  return undefined;
}

function parseBool(val: unknown): boolean | undefined {
  if (val === "true") return true;
  if (val === "false") return false;
  return undefined;
}

async function getProductAndVerifyOwner(productId: string, traderId: number) {
  const product = await prisma.product.findUnique({ 
    where: { id: productId },
    include: { productTypes: true }
  });
  if (!product) throw new AppError("Product not found", 404);
  if (product.traderId !== traderId) throw new AppError("Forbidden", 403);
  return product;
}

// ─── Create ───────────────────────────────────────────────────────────────

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await productService.create({
      ...req.body,
      traderId: Number(req.user!.id),
    });
    successResponse(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: result,
    });
  }
);

// ─── Get All ──────────────────────────────────────────────────────────────

export const getProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const type = parseProductType(req.query.type);

    const result = await productService.getAll({
      type,
      search: req.query.search as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      brandId: req.query.brandId as string | undefined,
      traderId: req.query.traderId ? Number(req.query.traderId) : undefined,
      filter: req.query.filter as string | undefined,
      isBestDeal: parseBool(req.query.isBestDeal),
      isMostPopular: parseBool(req.query.isMostPopular),
      isPremiumCollection: parseBool(req.query.isPremiumCollection),
      isFeatured: parseBool(req.query.isFeatured),
      size: req.query.size as string | undefined,
      color: req.query.color as string | undefined,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      rating: req.query.rating ? Number(req.query.rating) : undefined,
      stock: req.query.stock as "in_stock" | "out_of_stock" | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || DEFAULT_PAGE_LIMIT,
      collectionId: req.query.collectionId as string | undefined,
    });

    successResponse(res, {
      message: "Products fetched successfully",
      data: result,
    });
  }
);

// ─── Recommendations ──────────────────────────────────────────────────────

export const getRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
    const type = parseProductType(req.query.type);

    let categories: string[] | undefined;
    if (
      typeof req.query.categories === "string" &&
      req.query.categories.trim() !== ""
    ) {
      categories = req.query.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    } else if (Array.isArray(req.query.categories)) {
      categories = (req.query.categories as string[])
        .map((c) => String(c).trim())
        .filter(Boolean);
    }

    const result = await productService.getRecommendations({
      type,
      categories,
      limit: Number(req.query.limit) || DEFAULT_RECOMMENDATION_LIMIT,
      excludeId:
        typeof req.query.excludeId === "string" ? req.query.excludeId : undefined,
      categoryId:
        typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
      size: typeof req.query.size === "string" ? req.query.size : undefined,
      color: typeof req.query.color === "string" ? req.query.color : undefined,
      sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
      sortOrder:
        req.query.sortOrder === "asc" || req.query.sortOrder === "desc"
          ? req.query.sortOrder
          : undefined,
    });

    successResponse(res, {
      message: "Recommendations fetched successfully",
      data: result,
    });
  }
);

// ─── Get Trader Products ──────────────────────────────────────────────────

export const getTraderProducts = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const type = parseProductType(req.query.type);
    const result = await productService.getByTraderId(traderId, type);
    successResponse(res, {
      message: "Trader products fetched successfully",
      data: result,
    });
  }
);

// ─── Get One ──────────────────────────────────────────────────────────────

export const getProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await productService.getById(id);
    successResponse(res, {
      message: "Product fetched successfully",
      data: result,
    });
  }
);

// ─── Update ───────────────────────────────────────────────────────────────

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await productService.update(id, {
      ...req.body,
      traderId: Number(req.user!.id),
    });
    successResponse(res, {
      message: "Product updated successfully",
      data: result,
    });
  }
);

// ─── Delete ───────────────────────────────────────────────────────────────

/**
 * DELETE /products/:id            → delete entire product
 * DELETE /products/:id?type=SHOP  → remove only SHOP type (if multi-type)
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const traderId = Number(req.user!.id);
    const type = parseProductType(req.query.type);

    const result = await productService.delete(id, traderId, type);

    if (result && (result as any).deleted) {
      return successResponse(res, { message: "Product deleted successfully" });
    }

    successResponse(res, {
      message: type
        ? `Product type ${type} removed successfully`
        : "Product deleted successfully",
      data: result,
    });
  }
);

// ─── Color Management (JSON) ─────────────────────────────────────────────

const PRODUCT_FULL_INCLUDE = {
  productTypes: true,
  images: true,
  colors: { include: { sizes: true } },
  sizes: true,
  category: true,
  brand: true,
  materials: true,
} as const;

/**
 * POST /products/:productId/colors
 * Body: { color: string, minOrder?: number, stock?: number, images?: { url, direction? }[], sizes?: { size }[] }
 */
  export const addProductColor = asyncHandler(
    async (req: Request, res: Response) => {
      const traderId = Number(req.user!.id);
      const productId = String(req.params.productId);
  
      const product = await getProductAndVerifyOwner(productId, traderId);
  
      const { color, minOrder = 1, stock = 0, images = [], sizes = [] } = req.body as {
        color: string;
        minOrder?: number;
        stock?: number;
        images?: { url: string; direction?: string }[];
        sizes?: { size: string; quantity?: number }[];
      };
  
      if (!color) throw new AppError("color is required", 400);

      const isBlank = product.productTypes.some((pt) => pt.type === "BLANK");
      if (images && images.length) {
        if (!isBlank && images.some((img) => img.direction)) {
          throw new AppError("Image direction can only be specified for BLANK products", 400);
        }
      }

    const newColor = await prisma.productColor.create({
      data: {
        color,
        minOrder: Number(minOrder),
        stock: Number(stock),
        productId,
        ...(sizes.length > 0 ? {
          sizes: {
            create: sizes.map((s) => ({
              size: String(s.size),
              quantity: s.quantity ?? 0,
              productId,
            })),
          }
        } : {}),
      },
    });

    // Add images for this color
    if (images.length) {
      await prisma.productImage.createMany({
        data: images.map((img) => ({
          url: img.url,
          color,
          direction: (img.direction as any) ?? null,
          colorId: newColor.id,
          productId,
        })),
      });
    }

    // Recalculate stock
    const allSizes = await prisma.productSize.findMany({ where: { productId } });
    const totalStock = allSizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
    await prisma.product.update({ where: { id: productId }, data: { stock: totalStock } });

    const updated = await prisma.product.findUnique({
      where: { id: productId },
      include: PRODUCT_FULL_INCLUDE,
    });

    successResponse(res, {
      statusCode: 201,
      message: "Color added successfully",
      data: updated,
    });
  }
);

/**
 * DELETE /products/colors/:colorId
 */
export const deleteProductColor = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const colorId = String(req.params.colorId);

    const colorRecord = await prisma.productColor.findUnique({ where: { id: colorId } });
    if (!colorRecord) throw new AppError("Color not found", 404);

    await getProductAndVerifyOwner(colorRecord.productId, traderId);

    // Remove images linked to this color
    await prisma.productImage.deleteMany({
      where: { productId: colorRecord.productId, color: colorRecord.color },
    });

    // Delete color (cascade removes nested sizes)
    await prisma.productColor.delete({ where: { id: colorId } });

    successResponse(res, { message: "Color deleted successfully" });
  }
);

// ─── Image Management (JSON) ──────────────────────────────────────────────

/**
 * POST /products/:productId/images
 * Body: { images: { url, color?, direction?, colorId? }[] }
 * Adds one or more images to a product.
 */
  export const addProductImages = asyncHandler(
    async (req: Request, res: Response) => {
      const traderId = Number(req.user!.id);
      const productId = String(req.params.productId);
  
      const product = await getProductAndVerifyOwner(productId, traderId);
  
      const { images } = req.body as {
        images: { url: string; color?: string; direction?: string; colorId?: string }[];
      };
  
      if (!images || !images.length) throw new AppError("images array is required", 400);
  
      const isBlank = product.productTypes.some((pt) => pt.type === "BLANK");
      if (!isBlank && images.some((img) => img.direction)) {
        throw new AppError("Image direction can only be specified for BLANK products", 400);
      }

    await prisma.productImage.createMany({
      data: images.map((img) => ({
        url: img.url,
        color: img.color ?? null,
        direction: (img.direction as any) ?? null,
        colorId: img.colorId ?? null,
        productId,
      })),
    });

    const updated = await prisma.product.findUnique({
      where: { id: productId },
      include: PRODUCT_FULL_INCLUDE,
    });

    successResponse(res, {
      statusCode: 201,
      message: "Images added successfully",
      data: updated,
    });
  }
);

/**
 * PUT /products/colors/:colorId/images
 * Body: { images: { url, direction? }[] }
 * Replaces all images for a specific color.
 */
  export const replaceColorImages = asyncHandler(
    async (req: Request, res: Response) => {
      const traderId = Number(req.user!.id);
      const colorId = String(req.params.colorId);
  
      const colorRecord = await prisma.productColor.findUnique({ where: { id: colorId } });
      if (!colorRecord) throw new AppError("Color not found", 404);
  
      const product = await getProductAndVerifyOwner(colorRecord.productId, traderId);
  
      const { images } = req.body as {
        images: { url: string; direction?: string }[];
      };
  
      if (!images || !images.length) throw new AppError("images array is required", 400);

      const isBlank = product.productTypes.some((pt) => pt.type === "BLANK");
      if (!isBlank && images.some((img) => img.direction)) {
        throw new AppError("Image direction can only be specified for BLANK products", 400);
      }

    // Delete old images for this color
    await prisma.productImage.deleteMany({
      where: { productId: colorRecord.productId, color: colorRecord.color },
    });

    // Create new ones
    await prisma.productImage.createMany({
      data: images.map((img) => ({
        url: img.url,
        color: colorRecord.color,
        direction: (img.direction as any) ?? null,
        colorId,
        productId: colorRecord.productId,
      })),
    });

    const updated = await prisma.product.findUnique({
      where: { id: colorRecord.productId },
      include: PRODUCT_FULL_INCLUDE,
    });

    successResponse(res, {
      message: "Color images replaced successfully",
      data: updated,
    });
  }
);

/**
 * DELETE /products/images/:imageId
 */
export const deleteProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const imageId = String(req.params.imageId);

    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw new AppError("Image not found", 404);

    await getProductAndVerifyOwner(image.productId, traderId);
    await prisma.productImage.delete({ where: { id: imageId } });

    successResponse(res, { message: "Image deleted successfully" });
  }
);

// ─── Size / Variant Management (JSON) ────────────────────────────────────

/**
 * POST /products/colors/:colorId/sizes
 * Body: { size: string, quantity?: number }
 */
export const addProductSize = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const colorId = String(req.params.colorId);

    const colorRecord = await prisma.productColor.findUnique({ where: { id: colorId } });
    if (!colorRecord) throw new AppError("Color not found", 404);

    await getProductAndVerifyOwner(colorRecord.productId, traderId);

    const { size, quantity = 0 } = req.body as { size: string; quantity?: number };
    if (!size) throw new AppError("size is required", 400);

    await prisma.productSize.create({
      data: {
        size: String(size),
        quantity: Number(quantity),
        color: colorRecord.color,
        productId: colorRecord.productId,
        productColorId: colorId,
      },
    });

    // Recalculate total stock
    const allSizes = await prisma.productSize.findMany({
      where: { productId: colorRecord.productId },
    });
    const totalStock = allSizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
    await prisma.product.update({
      where: { id: colorRecord.productId },
      data: { stock: totalStock },
    });

    const updated = await prisma.product.findUnique({
      where: { id: colorRecord.productId },
      include: PRODUCT_FULL_INCLUDE,
    });

    successResponse(res, {
      statusCode: 201,
      message: "Size added successfully",
      data: updated,
    });
  }
);

/**
 * PATCH /products/variants/:variantId
 * Body: { quantity: number }
 */
export const updateProductVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const variantId = String(req.params.variantId);

    const variant = await prisma.productSize.findUnique({ where: { id: variantId } });
    if (!variant) throw new AppError("Variant not found", 404);

    await getProductAndVerifyOwner(variant.productId, traderId);

    const { quantity } = req.body as { quantity: number };
    if (quantity === undefined) throw new AppError("quantity is required", 400);

    await prisma.productSize.update({
      where: { id: variantId },
      data: { quantity: Number(quantity) },
    });

    // Recalculate total stock
    const allSizes = await prisma.productSize.findMany({
      where: { productId: variant.productId },
    });
    const totalStock = allSizes.reduce((sum, s) => sum + (s.quantity || 0), 0);

    const updated = await prisma.product.update({
      where: { id: variant.productId },
      data: { stock: totalStock },
      include: PRODUCT_FULL_INCLUDE,
    });

    successResponse(res, {
      message: "Variant updated successfully",
      data: updated,
    });
  }
);

/**
 * DELETE /products/variants/:variantId
 */
export const deleteProductVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const variantId = String(req.params.variantId);

    const variant = await prisma.productSize.findUnique({ where: { id: variantId } });
    if (!variant) throw new AppError("Variant not found", 404);

    await getProductAndVerifyOwner(variant.productId, traderId);
    await prisma.productSize.delete({ where: { id: variantId } });

    // Recalculate total stock
    const allSizes = await prisma.productSize.findMany({
      where: { productId: variant.productId },
    });
    const totalStock = allSizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
    await prisma.product.update({
      where: { id: variant.productId },
      data: { stock: totalStock },
    });

    successResponse(res, { message: "Variant deleted successfully" });
  }
);
