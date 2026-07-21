import prisma from "../utils/prismaClient.js";
import {
  ProductCreateData,
  ProductUpdateData,
  ProductSizeInput,
  ProductColorInput,
} from "../types/product.types.js";
import { Prisma, ProductType } from "@prisma/client";
import type { GetProductsQuery } from "../types/product.types.js";

type Transaction = Prisma.TransactionClient;

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns an orderBy object based on the sortBy field.
 * The price-based sorting uses shopPrice as default price field.
 */
function getOrderBy(sortBy?: string, sortOrder: "asc" | "desc" = "asc") {
  switch (sortBy) {
    case "name":
      return { name: sortOrder };
    case "price":
    case "shopPrice":
      return { shopPrice: sortOrder };
    case "retailPrice":
      return { retailPrice: sortOrder };
    case "wholesalePrice":
      return { wholesalePrice: sortOrder };
    case "rating":
      return { rating: sortOrder };
    case "createdAt":
      return { createdAt: sortOrder };
    default:
      return { createdAt: "desc" as const };
  }
}

/**
 * Returns the effective price filter depending on product type.
 */
function buildPriceFilter(
  type: ProductType | undefined,
  priceMin: number | undefined,
  priceMax: number | undefined
): Prisma.ProductWhereInput[] {
  if (priceMin === undefined && priceMax === undefined) return [];
  const range: Prisma.FloatNullableFilter = {};
  if (priceMin !== undefined) range.gte = priceMin;
  if (priceMax !== undefined) range.lte = priceMax;

  if (type === ProductType.RETAIL) return [{ retailPrice: range }];
  if (type === ProductType.WHOLESALE) return [{ wholesalePrice: range }];
  if (type === ProductType.BLANK) return [{ blankPrice: range }];
  // SHOP or no type → shopPrice with flash deal awareness
  return [
    {
      OR: [
        { isFlashDeals: true, flashDealPrice: range },
        { isFlashDeals: false, shopPrice: range },
      ],
    },
  ];
}

/**
 * The standard include object for a full product query.
 */
const PRODUCT_INCLUDE = {
  productTypes: true,
  categories: true,
  brand: true,
  images: true,
  sizes: true,
  colors: {
    include: { sizes: true },
  },
  materials: true,
} as const;

// ─── Repository ─────────────────────────────────────────────────────────────

class ProductRepository {
  // ── CREATE ────────────────────────────────────────────────────────────────

  async create(data: ProductCreateData) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          sku: data.sku,
          stock: data.stock ?? 0,
          rating: data.rating ?? 0,

          // Pricing
          shopPrice: data.shopPrice ?? null,
          retailPrice: data.retailPrice ?? null,
          wholesalePrice: data.wholesalePrice ?? null,
          blankPrice: data.blankPrice ?? null,

          // SHOP
          sizeguide: data.sizeguide ?? null,
          isMustHave: data.isMustHave ?? false,
          isFlashDeals: data.isFlashDeals ?? false,
          flashDealPrice: data.flashDealPrice ?? null,
          flashDealEndsAt: data.flashDealEndsAt
            ? new Date(data.flashDealEndsAt)
            : null,

          // RETAIL
          depositAmount: data.depositAmount ?? null,
          securityDeposit: data.securityDeposit ?? null,
          termsAndConditions: data.termsAndConditions ?? null,
          privacyPolicy: data.privacyPolicy ?? null,
          isFeatured: data.isFeatured ?? false,

          // WHOLESALE
          minOrder: data.minOrder ?? 1,
          isBestDeal: data.isBestDeal ?? false,
          isMostPopular: data.isMostPopular ?? false,
          isPremiumCollection: data.isPremiumCollection ?? false,

          // BLANK
          isActive: data.isActive ?? true,

          // Relations
          trader: { connect: { id: data.traderId } },
          categories: { connect: data.categoryIds.map((id) => ({ id })) },

          ...(data.brandId && {
            brand: { connect: { id: data.brandId } },
          }),

          // Product types join table
          productTypes: {
            create: data.productTypes.map((type) => ({ type })),
          },

          // Materials (BLANK)
          ...(data.materials && data.materials.length > 0 && {
            materials: { create: data.materials },
          }),

          // Images
          ...(data.images && data.images.length > 0 && {
            images: {
              create: data.images.map((img) => ({
                url: img.url,
                color: img.color || null,
                direction: img.direction || null,
                colorId: img.colorId || null,
              })),
            },
          }),

          // Sizes (non-wholesale — wholesale sizes go under colors)
          ...(data.sizes && data.sizes.length > 0 && {
            sizes: {
              create: data.sizes.map((s: ProductSizeInput) =>
                typeof s === "string"
                  ? { size: s, quantity: 0 }
                  : {
                      size: s.size,
                      quantity: s.quantity ?? 0,
                      color: s.color ?? null,
                      productColorId: s.productColorId ?? null,
                    }
              ),
            },
          }),
        },
        include: PRODUCT_INCLUDE,
      });

      // WHOLESALE colors (nested with sizes)
      if (data.colors && data.colors.length > 0) {
        for (const col of data.colors as ProductColorInput[]) {
          await tx.productColor.create({
            data: {
              color: col.color,
              minOrder: col.minOrder ?? 1,
              stock: col.stock ?? 0,
              productId: product.id,
              ...(col.sizes && col.sizes.length > 0 ? {
                sizes: {
                  create: col.sizes.map((sz) => ({
                    size: sz.size,
                    quantity: sz.quantity ?? sz.stock ?? 0,
                    productId: product.id,
                  })),
                }
              } : {}),
            },
          });
        }
      }

      // Return with full include after colors are created
      return tx.product.findUnique({
        where: { id: product.id },
        include: PRODUCT_INCLUDE,
      });
    });
  }

  // ── FIND ALL ──────────────────────────────────────────────────────────────

  async findAll({
    type,
    search,
    categoryId,
    brandId,
    traderId,
    filter,
    isBestDeal,
    isMostPopular,
    isPremiumCollection,
    isFeatured,
    size,
    color,
    priceMin,
    priceMax,
    rating,
    stock,
    sortBy,
    sortOrder = "asc",
    page = 1,
    limit = 16,
    collectionId,
  }: GetProductsQuery) {
    const andConditions: Prisma.ProductWhereInput[] = [];

    // Type filter — product must have this type in its productTypes join table
    if (type) {
      andConditions.push({
        productTypes: { some: { type } },
      });
    }

    // Search
    if (search) {
      andConditions.push({ name: { contains: search } });
    }

    // Price range
    const priceConditions = buildPriceFilter(type, priceMin, priceMax);
    andConditions.push(...priceConditions);

    // SHOP filters
    if (filter === "must-have") andConditions.push({ isMustHave: true });
    if (filter === "flash-deals") andConditions.push({ isFlashDeals: true });

    // WHOLESALE filters
    if (isBestDeal !== undefined) andConditions.push({ isBestDeal });
    if (isMostPopular !== undefined) andConditions.push({ isMostPopular });
    if (isPremiumCollection !== undefined)
      andConditions.push({ isPremiumCollection });

    // RETAIL filters
    if (isFeatured !== undefined) andConditions.push({ isFeatured });
    if (filter === "featured") andConditions.push({ isFeatured: true });

    // Stock filter
    if (stock === "in_stock") andConditions.push({ stock: { gt: 0 } });
    if (stock === "out_of_stock") andConditions.push({ stock: 0 });

    // Rating
    if (rating !== undefined) andConditions.push({ rating: { gte: rating } });

    const where: Prisma.ProductWhereInput = {
      ...(categoryId && { categories: { some: { id: categoryId } } }),
      ...(brandId && { brandId }),
      ...(traderId && { traderId }),
      ...(size && { sizes: { some: { size } } }),
      ...(color && { colors: { some: { color } } }),
      ...(collectionId && {
        collections: { some: { id: collectionId } },
      }),
      ...(andConditions.length > 0 && { AND: andConditions }),
    };

    const total = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: getOrderBy(sortBy, sortOrder),
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────

  async findRecommendations({
    type,
    categories,
    limit = 4,
    excludeId,
    categoryId,
    size,
    color,
    sortBy,
    sortOrder = "desc",
  }: {
    type?: ProductType | undefined;
    categories?: string[] | undefined;
    limit?: number | undefined;
    excludeId?: string | undefined;
    categoryId?: string | undefined;
    size?: string | undefined;
    color?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (excludeId) where.id = { not: excludeId };
    if (type) where.productTypes = { some: { type } };

    if (categoryId) {
      where.categories = { some: { id: categoryId } };
    } else if (categories && categories.length > 0) {
      where.categories = { some: { id: { in: categories } } };
    }

    if (size) where.sizes = { some: { size } };
    if (color) where.colors = { some: { color } };

    const orderBy = getOrderBy(sortBy || "rating", sortOrder);

    const products = await prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy,
      take: limit,
    });

    // Fallback: if not enough results, fill with any products
    if (
      products.length < limit &&
      !categoryId &&
      !size &&
      !color &&
      categories &&
      categories.length > 0
    ) {
      const existingIds = products.map((p) => p.id);
      if (excludeId) existingIds.push(excludeId);
      const remainingLimit = limit - products.length;
      const fallback = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          ...(type && { productTypes: { some: { type } } }),
        },
        include: PRODUCT_INCLUDE,
        orderBy,
        take: remainingLimit,
      });
      products.push(...fallback);
    }

    return {
      products,
      pagination: { page: 1, limit, total: products.length, totalPages: 1 },
    };
  }

  // ── FIND ONE ──────────────────────────────────────────────────────────────

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
  }

  findByTraderId(traderId: number, type?: ProductType) {
    return prisma.product.findMany({
      where: {
        traderId,
        ...(type && { productTypes: { some: { type } } }),
      },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────

  async update(id: string, data: ProductUpdateData) {
    return prisma.$transaction(async (tx) => {
      // Update product types if provided
      if (data.productTypes && data.productTypes.length > 0) {
        // Remove types not in the new list
        await tx.productTypeRelation.deleteMany({
          where: {
            productId: id,
            type: { notIn: data.productTypes },
          },
        });
        // Upsert each new type
        for (const type of data.productTypes) {
          await tx.productTypeRelation.upsert({
            where: { productId_type: { productId: id, type } },
            create: { productId: id, type },
            update: {},
          });
        }
      }

      // Replace images if provided
      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }

      // Replace sizes if provided
      if (data.sizes) {
        await tx.productSize.deleteMany({ where: { productId: id } });
      }

      // Replace colors if provided
      if (data.colors !== undefined) {
        // Cascade deletes sizes linked to colors
        await tx.productColor.deleteMany({ where: { productId: id } });
      }

      // Replace materials if provided
      if (data.materials !== undefined) {
        await tx.productMaterial.deleteMany({ where: { productId: id } });
      }

      const updatePayload: any = {
        ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.stock !== undefined && { stock: data.stock }),
          ...(data.rating !== undefined && { rating: data.rating }),

          // Pricing
          ...(data.shopPrice !== undefined && { shopPrice: data.shopPrice }),
          ...(data.retailPrice !== undefined && {
            retailPrice: data.retailPrice,
          }),
          ...(data.wholesalePrice !== undefined && {
            wholesalePrice: data.wholesalePrice,
          }),
          ...(data.blankPrice !== undefined && { blankPrice: data.blankPrice }),

          // SHOP
          ...(data.sizeguide !== undefined && { sizeguide: data.sizeguide }),
          ...(data.isMustHave !== undefined && { isMustHave: data.isMustHave }),
          ...(data.isFlashDeals !== undefined && {
            isFlashDeals: data.isFlashDeals,
          }),
          ...(data.flashDealPrice !== undefined && {
            flashDealPrice: data.flashDealPrice,
          }),
          ...(data.flashDealEndsAt !== undefined && {
            flashDealEndsAt: data.flashDealEndsAt
              ? new Date(data.flashDealEndsAt)
              : null,
          }),

          // RETAIL
          ...(data.depositAmount !== undefined && {
            depositAmount: data.depositAmount,
          }),
          ...(data.securityDeposit !== undefined && {
            securityDeposit: data.securityDeposit,
          }),
          ...(data.termsAndConditions !== undefined && {
            termsAndConditions: data.termsAndConditions,
          }),
          ...(data.privacyPolicy !== undefined && {
            privacyPolicy: data.privacyPolicy,
          }),
          ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),

          // WHOLESALE
          ...(data.minOrder !== undefined && { minOrder: data.minOrder }),
          ...(data.isBestDeal !== undefined && { isBestDeal: data.isBestDeal }),
          ...(data.isMostPopular !== undefined && {
            isMostPopular: data.isMostPopular,
          }),
          ...(data.isPremiumCollection !== undefined && {
            isPremiumCollection: data.isPremiumCollection,
          }),

          // BLANK
          ...(data.isActive !== undefined && { isActive: data.isActive }),

          // Category / brand
          ...(data.categoryIds && {
            categories: { set: data.categoryIds.map((id) => ({ id })) },
          }),
          ...(data.brandId !== undefined && {
            brand: data.brandId
              ? { connect: { id: data.brandId } }
              : { disconnect: true },
          }),

          // Images
          ...(data.images && {
            images: {
              create: data.images.map((img) => ({
                url: img.url,
                color: img.color || null,
                direction: img.direction || null,
                colorId: img.colorId || null,
              })),
            },
          }),

          // Sizes
          ...(data.sizes && {
            sizes: {
              create: data.sizes.map((s: ProductSizeInput) =>
                typeof s === "string"
                  ? { size: s, quantity: 0 }
                  : {
                      size: s.size,
                      quantity: s.quantity ?? 0,
                      color: s.color ?? null,
                      productColorId: s.productColorId ?? null,
                    }
              ),
            },
          }),

          // Materials
          ...(data.materials && {
            materials: { create: data.materials },
          }),
      };

      const updated = await tx.product.update({
        where: { id },
        data: updatePayload,
        include: PRODUCT_INCLUDE,
      });

      // Create new colors (after deleting old ones)
      if (data.colors && data.colors.length > 0) {
        for (const col of data.colors as ProductColorInput[]) {
          await tx.productColor.create({
            data: {
              color: col.color,
              minOrder: col.minOrder ?? 1,
              stock: col.stock ?? 0,
              productId: id,
              ...(col.sizes && col.sizes.length > 0 ? {
                sizes: {
                  create: col.sizes.map((sz) => ({
                    size: sz.size,
                    quantity: sz.quantity ?? sz.stock ?? 0,
                    productId: id,
                  })),
                }
              } : {}),
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: PRODUCT_INCLUDE,
      });
    });
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  /**
   * Removes a specific ProductType from a product.
   * If the product only has that one type, the entire product is deleted.
   * Returns { deleted: true } if the product was fully deleted,
   * or the updated product otherwise.
   */
  async removeProductType(id: string, type: ProductType) {
    return prisma.$transaction(async (tx) => {
      const typeCount = await tx.productTypeRelation.count({
        where: { productId: id },
      });

      if (typeCount <= 1) {
        // Only one type — delete the whole product
        await tx.product.delete({ where: { id } });
        return { deleted: true };
      }

      // Multiple types — remove just this type
      await tx.productTypeRelation.delete({
        where: { productId_type: { productId: id, type } },
      });

      return tx.product.findUnique({
        where: { id },
        include: PRODUCT_INCLUDE,
      });
    });
  }

  // ── RATING ───────────────────────────────────────────────────────────────

  updateRating(id: string, rating: number, tx: Transaction = prisma) {
    return tx.product.update({
      where: { id },
      data: { rating },
    });
  }
}

export const productRepository = new ProductRepository();
