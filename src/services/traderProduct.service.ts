import { productRepository } from "../repositories/product.repository.js";
import prisma from "../utils/prismaClient.js";
import AppError from "../utils/AppError.util.js";
import { TraderProductCreateData } from "../types/product.types.js";

export class TraderProductService {
  async create(data: TraderProductCreateData) {
    // 1. Verify Category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // 2. Perform validations
    if (!data.name || data.name.trim() === "") {
      throw new AppError("Product title is required", 400);
    }
    if (data.price <= 0) {
      throw new AppError("Price must be greater than 0", 400);
    }
    if (!data.colors || data.colors.length === 0) {
      throw new AppError("At least one color is required", 400);
    }

    const seenColors = new Set<string>();
    for (const color of data.colors) {
      const nameLower = color.colorName.toLowerCase().trim();
      if (seenColors.has(nameLower)) {
        throw new AppError(`Duplicate color "${color.colorName}" detected`, 400);
      }
      seenColors.add(nameLower);

      if (!color.variants || color.variants.length === 0) {
        throw new AppError(`Color "${color.colorName}" must have at least one size`, 400);
      }
      if (!color.images || color.images.length === 0) {
        throw new AppError(`Color "${color.colorName}" must have at least one image`, 400);
      }

      const seenSizes = new Set<string>();
      for (const variant of color.variants) {
        const sizeLower = variant.size.toLowerCase().trim();
        if (seenSizes.has(sizeLower)) {
          throw new AppError(`Duplicate size "${variant.size}" inside color "${color.colorName}"`, 400);
        }
        seenSizes.add(sizeLower);

        if (variant.quantity < 0) {
          throw new AppError("Quantity must be greater than or equal to 0", 400);
        }
      }
    }

    // 3. Create product using repository (uses nested transaction)
    const product = await productRepository.create(data);
    return this.mapProduct(product);
  }

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return this.mapProduct(product);
  }

  async delete(id: string, traderId: number) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    if (product.traderId !== traderId) {
      throw new AppError("Unauthorized to delete this product", 403);
    }
    await productRepository.delete(id);
    return true;
  }

  // ─── Update APIs ────────────────────────────────────────────────────────────

  async addColor(
    productId: string,
    traderId: number,
    colorData: {
      colorName: string;
      colorCode?: string;
      images: { imageUrl: string; isPrimary?: boolean }[];
      variants: { size: string; quantity: number; sku?: string }[];
    }
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Product not found", 404);
    if (product.traderId !== traderId) throw new AppError("Unauthorized", 403);

    // Check duplicate color
    const existing = await prisma.productColor.findFirst({
      where: { productId, colorName: { equals: colorData.colorName } },
    });
    if (existing) throw new AppError(`Color "${colorData.colorName}" already exists`, 400);

    return prisma.$transaction(async (tx) => {
      const color = await tx.productColor.create({
        data: {
          colorName: colorData.colorName,
          colorCode: colorData.colorCode ?? null,
          productId,
          images: {
            create: colorData.images.map((img) => ({
              imageUrl: img.imageUrl,
              isPrimary: img.isPrimary ?? false,
            })),
          },
          variants: {
            create: colorData.variants.map((v) => ({
              size: v.size,
              quantity: v.quantity,
              sku: v.sku ?? null,
            })),
          },
        },
        include: {
          images: true,
          variants: true,
        },
      });
      return color;
    });
  }

  async deleteColor(colorId: string, traderId: number) {
    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
      include: { product: true },
    });
    if (!color) throw new AppError("Color not found", 404);
    if (color.product.traderId !== traderId) throw new AppError("Unauthorized", 403);

    await prisma.productColor.delete({ where: { id: colorId } });
    return true;
  }

  async replaceColorImages(
    colorId: string,
    traderId: number,
    images: { imageUrl: string; isPrimary?: boolean }[]
  ) {
    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
      include: { product: true },
    });
    if (!color) throw new AppError("Color not found", 404);
    if (color.product.traderId !== traderId) throw new AppError("Unauthorized", 403);

    return prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productColorId: colorId } });
      const created = await Promise.all(
        images.map((img) =>
          tx.productImage.create({
            data: {
              imageUrl: img.imageUrl,
              isPrimary: img.isPrimary ?? false,
              productColorId: colorId,
            },
          })
        )
      );
      return created;
    });
  }

  async addImages(
    colorId: string,
    traderId: number,
    images: { imageUrl: string; isPrimary?: boolean }[]
  ) {
    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
      include: { product: true },
    });
    if (!color) throw new AppError("Color not found", 404);
    if (color.product.traderId !== traderId) throw new AppError("Unauthorized", 403);

    const created = await Promise.all(
      images.map((img) =>
        prisma.productImage.create({
          data: {
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary ?? false,
            productColorId: colorId,
          },
        })
      )
    );
    return created;
  }

  async deleteImage(imageId: string, traderId: number) {
    const img = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { productColor: { include: { product: true } } },
    });
    if (!img) throw new AppError("Image not found", 404);
    if (img.productColor.product.traderId !== traderId) throw new AppError("Unauthorized", 403);

    await prisma.productImage.delete({ where: { id: imageId } });
    return true;
  }

  async updateSizeQuantity(variantId: string, traderId: number, quantity: number) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { productColor: { include: { product: true } } },
    });
    if (!variant) throw new AppError("Variant not found", 404);
    if (variant.productColor.product.traderId !== traderId) throw new AppError("Unauthorized", 403);
    if (quantity < 0) throw new AppError("Quantity must be greater than or equal to 0", 400);

    return prisma.productVariant.update({
      where: { id: variantId },
      data: { quantity },
    });
  }

  async addSize(
    colorId: string,
    traderId: number,
    size: string,
    quantity: number,
    sku?: string
  ) {
    const color = await prisma.productColor.findUnique({
      where: { id: colorId },
      include: { product: true },
    });
    if (!color) throw new AppError("Color not found", 404);
    if (color.product.traderId !== traderId) throw new AppError("Unauthorized", 403);

    // Check duplicate size
    const existing = await prisma.productVariant.findFirst({
      where: { productColorId: colorId, size: { equals: size } },
    });
    if (existing) throw new AppError(`Size "${size}" already exists for this color`, 400);
    if (quantity < 0) throw new AppError("Quantity must be greater than or equal to 0", 400);

    return prisma.productVariant.create({
      data: {
        size,
        quantity,
        sku: sku ?? null,
        productColorId: colorId,
      },
    });
  }

  async deleteSize(variantId: string, traderId: number) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { productColor: { include: { product: true } } },
    });
    if (!variant) throw new AppError("Variant not found", 404);
    if (variant.productColor.product.traderId !== traderId) throw new AppError("Unauthorized", 403);

    await prisma.productVariant.delete({ where: { id: variantId } });
    return true;
  }

  // ─── Helper Mappers ─────────────────────────────────────────────────────────

  private mapProduct(product: any) {
    return {
      id: product.id,
      title: product.name, // Mapping database field `name` to response field `title`
      description: product.description,
      price: product.price,
      brandId: product.brandId,
      categoryId: product.categoryId,
      rating: product.rating,
      traderId: product.traderId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      colors: (product.colors || []).map((c: any) => ({
        id: c.id,
        colorName: c.colorName,
        colorCode: c.colorCode,
        images: (c.images || []).map((img: any) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })),
        variants: (c.variants || []).map((v: any) => ({
          id: v.id,
          size: v.size,
          quantity: v.quantity,
          sku: v.sku,
        })),
      })),
    };
  }
}

export const traderProductService = new TraderProductService();
