import type { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { successResponse } from "../utils/response.util.js";
import { productService } from "../services/product.service.js";
import { ProductType } from "@prisma/client";
import prisma from "../utils/prismaClient.js";
import AppError from "../utils/AppError.util.js";

function buildImageUrl(req: Request, filename: string) {
  return `${req.protocol}://${req.get("host")}/uploads/products/${filename}`;
}

async function getProductAndVerifyOwner(productId: string, traderId: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new AppError("Product not found", 404);
  if (product.traderId !== traderId) throw new AppError("Forbidden", 403);
  return product;
}

// ─── Create Product (file upload based) ────────────────────────────────────

export const createTraderProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const body = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    // productTypes: can come as JSON string or array
    let productTypes: ProductType[] = [];
    if (body.productTypes) {
      const raw =
        typeof body.productTypes === "string"
          ? JSON.parse(body.productTypes)
          : body.productTypes;
      productTypes = Array.isArray(raw) ? raw : [raw];
    } else if (body.productType) {
      productTypes = [body.productType as ProductType];
    }

    if (!productTypes.length) {
      throw new AppError("productTypes is required", 400);
    }

    // Parse colors JSON: [{ name, color, code, sizes: [{ size, quantity }] }]
    let parsedColors: {
      name: string;
      color: string;
      code: string;
      minOrder?: number;
      stock?: number;
      sizes: { size: string; quantity: number }[];
    }[] = [];
    if (body.colors) {
      parsedColors =
        typeof body.colors === "string"
          ? JSON.parse(body.colors)
          : body.colors;
    }

    // Build images array from uploaded files
    const images: { url: string; color?: string }[] = [];
    for (const file of files) {
      const colorName = file.fieldname.replace(/^images_/, "");
      images.push({ url: buildImageUrl(req, file.filename), color: colorName });
    }

    // Build sizes and colors arrays from parsed colors
    const colors: {
      color: string;
      minOrder?: number;
      stock?: number;
      sizes?: { size: string }[];
    }[] = [];
    const sizes: { size: string; quantity: number; color: string }[] = [];

    for (const c of parsedColors) {
      const colorName = c.name || c.color;
      colors.push({
        color: colorName,
        minOrder: c.minOrder,
        stock: c.stock,
        sizes: c.sizes?.map((s) => ({ size: String(s.size) })),
      });
      for (const s of c.sizes || []) {
        if (s.size) {
          sizes.push({
            size: String(s.size),
            quantity: Number(s.quantity || 0),
            color: String(colorName),
          });
        }
      }
    }

    const flashDealPriceNum = body.flashDealPrice
      ? Number(body.flashDealPrice)
      : undefined;

    const result = await productService.create({
      productTypes,
      name: body.name,
      description: body.description || "",
      sku: body.sku ? String(body.sku) : `SKU-${Date.now()}`,
      categoryId: String(body.categoryId),
      brandId: body.brandId ? String(body.brandId) : undefined,
      stock: body.stock ? Number(body.stock) : 0,
      rating: 0,
      traderId,
      images,
      sizes,
      colors,

      // Pricing
      shopPrice: body.shopPrice ? Number(body.shopPrice) : undefined,
      retailPrice: body.retailPrice ? Number(body.retailPrice) : undefined,
      wholesalePrice: body.wholesalePrice
        ? Number(body.wholesalePrice)
        : undefined,
      blankPrice: body.blankPrice ? Number(body.blankPrice) : undefined,

      // SHOP
      isMustHave: body.isMustHave === "true" || body.isMustHave === true,
      isFlashDeals: body.isFlashDeals === "true" || body.isFlashDeals === true,
      ...(flashDealPriceNum !== undefined && {
        flashDealPrice: flashDealPriceNum,
      }),
      ...(body.flashDealEndsAt && {
        flashDealEndsAt: String(body.flashDealEndsAt),
      }),

      // RETAIL
      depositAmount: body.depositAmount ? Number(body.depositAmount) : undefined,
      securityDeposit: body.securityDeposit
        ? Number(body.securityDeposit)
        : undefined,
      termsAndConditions: body.termsAndConditions || undefined,
      privacyPolicy: body.privacyPolicy || undefined,

      // BLANK
      materials: body.materials
        ? typeof body.materials === "string"
          ? JSON.parse(body.materials)
          : body.materials
        : undefined,
      isActive: body.isActive !== "false" && body.isActive !== false,
    });

    successResponse(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: result,
    });
  }
);

// ─── Add Color ────────────────────────────────────────────────────────────

export const addProductColor = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const productId = String(req.params.productId);
    const files = (req.files as Express.Multer.File[]) || [];

    await getProductAndVerifyOwner(productId, traderId);

    const color = String(req.body.colorName || req.body.colorCode || "");
    const minOrder = req.body.minOrder ? Number(req.body.minOrder) : 1;
    const stock = req.body.stock ? Number(req.body.stock) : 0;

    const newColor = await prisma.productColor.create({
      data: {
        color,
        minOrder,
        stock,
        productId,
      },
    });

    for (const file of files) {
      await prisma.productImage.create({
        data: {
          url: buildImageUrl(req, file.filename),
          color,
          productId,
        },
      });
    }

    if (req.body.variants) {
      const variants =
        typeof req.body.variants === "string"
          ? JSON.parse(req.body.variants)
          : req.body.variants;
      for (const v of variants) {
        await prisma.productSize.create({
          data: {
            size: String(v.size),
            productId,
            quantity: Number(v.quantity || 0),
            color,
            productColorId: newColor.id,
          },
        });
      }
    }

    const allSizes = await prisma.productSize.findMany({ where: { productId } });
    const totalStock = allSizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
    await prisma.product.update({
      where: { id: productId },
      data: { stock: totalStock },
    });

    const updated = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productTypes: true,
        colors: { include: { sizes: true } },
        images: true,
        sizes: true,
        category: true,
        brand: true,
        materials: true,
      },
    });

    successResponse(res, {
      statusCode: 201,
      message: "Color added successfully",
      data: updated,
    });
  }
);

// ─── Delete Color ─────────────────────────────────────────────────────────

export const deleteProductColor = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const colorId = String(req.params.colorId);

    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
    });
    if (!color) throw new AppError("Color not found", 404);
    await getProductAndVerifyOwner(color.productId, traderId);

    // Delete images associated with this color
    await prisma.productImage.deleteMany({
      where: { productId: color.productId, color: color.color },
    });

    // Delete the color (cascade deletes nested sizes)
    await prisma.productColor.delete({ where: { id: colorId } });

    successResponse(res, { message: "Color deleted successfully" });
  }
);

// ─── Replace Color Images ─────────────────────────────────────────────────

export const replaceProductColorImages = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const colorId = String(req.params.colorId);
    const files = (req.files as Express.Multer.File[]) || [];

    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
    });
    if (!color) throw new AppError("Color not found", 404);
    await getProductAndVerifyOwner(color.productId, traderId);

    await prisma.productImage.deleteMany({
      where: { productId: color.productId, color: color.color },
    });

    for (const file of files) {
      await prisma.productImage.create({
        data: {
          url: buildImageUrl(req, file.filename),
          color: color.color,
          productId: color.productId,
        },
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id: color.productId },
      include: {
        productTypes: true,
        images: true,
        colors: { include: { sizes: true } },
        sizes: true,
        category: true,
        brand: true,
        materials: true,
      },
    });

    successResponse(res, {
      message: "Images replaced successfully",
      data: updated,
    });
  }
);

// ─── Add Color Images ─────────────────────────────────────────────────────

export const addProductColorImages = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const colorId = String(req.params.colorId);
    const files = (req.files as Express.Multer.File[]) || [];

    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
    });
    if (!color) throw new AppError("Color not found", 404);
    await getProductAndVerifyOwner(color.productId, traderId);

    for (const file of files) {
      await prisma.productImage.create({
        data: {
          url: buildImageUrl(req, file.filename),
          color: color.color,
          productId: color.productId,
        },
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id: color.productId },
      include: {
        productTypes: true,
        images: true,
        colors: { include: { sizes: true } },
        sizes: true,
        category: true,
        brand: true,
        materials: true,
      },
    });

    successResponse(res, {
      statusCode: 201,
      message: "Images added successfully",
      data: updated,
    });
  }
);

// ─── Delete Image ─────────────────────────────────────────────────────────

export const deleteProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const imageId = String(req.params.imageId);

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new AppError("Image not found", 404);
    await getProductAndVerifyOwner(image.productId, traderId);

    await prisma.productImage.delete({ where: { id: imageId } });

    successResponse(res, { message: "Image deleted successfully" });
  }
);

// ─── Update Variant (size quantity) ───────────────────────────────────────

export const updateProductVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const variantId = String(req.params.variantId);
    const { quantity } = req.body;

    const variant = await prisma.productSize.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new AppError("Variant not found", 404);
    await getProductAndVerifyOwner(variant.productId, traderId);

    await prisma.productSize.update({
      where: { id: variantId },
      data: { quantity: Number(quantity) },
    });

    const allSizes = await prisma.productSize.findMany({
      where: { productId: variant.productId },
    });
    const totalStock = allSizes.reduce(
      (sum, s) => sum + (s.quantity || 0),
      0
    );

    const updated = await prisma.product.update({
      where: { id: variant.productId },
      data: { stock: totalStock },
      include: {
        productTypes: true,
        sizes: true,
        colors: { include: { sizes: true } },
        images: true,
        category: true,
        brand: true,
        materials: true,
      },
    });

    successResponse(res, {
      message: "Variant updated successfully",
      data: updated,
    });
  }
);

// ─── Add Size ──────────────────────────────────────────────────────────────

export const addProductSize = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const colorId = String(req.params.colorId);
    const { size, quantity } = req.body;

    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
    });
    if (!color) throw new AppError("Color not found", 404);
    await getProductAndVerifyOwner(color.productId, traderId);

    await prisma.productSize.create({
      data: {
        size: String(size),
        productId: color.productId,
        quantity: Number(quantity || 0),
        color: color.color,
        productColorId: colorId,
      },
    });

    const allSizes = await prisma.productSize.findMany({
      where: { productId: color.productId },
    });
    const totalStock = allSizes.reduce(
      (sum, s) => sum + (s.quantity || 0),
      0
    );
    await prisma.product.update({
      where: { id: color.productId },
      data: { stock: totalStock },
    });

    const updated = await prisma.product.findUnique({
      where: { id: color.productId },
      include: {
        productTypes: true,
        sizes: true,
        colors: { include: { sizes: true } },
        images: true,
        category: true,
        brand: true,
        materials: true,
      },
    });

    successResponse(res, {
      statusCode: 201,
      message: "Size added successfully",
      data: updated,
    });
  }
);

// ─── Delete Variant ───────────────────────────────────────────────────────

export const deleteProductVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const traderId = Number(req.user!.id);
    const variantId = String(req.params.variantId);

    const variant = await prisma.productSize.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new AppError("Variant not found", 404);
    await getProductAndVerifyOwner(variant.productId, traderId);

    await prisma.productSize.delete({ where: { id: variantId } });

    const allSizes = await prisma.productSize.findMany({
      where: { productId: variant.productId },
    });
    const totalStock = allSizes.reduce(
      (sum, s) => sum + (s.quantity || 0),
      0
    );
    await prisma.product.update({
      where: { id: variant.productId },
      data: { stock: totalStock },
    });

    successResponse(res, { message: "Variant deleted successfully" });
  }
);
