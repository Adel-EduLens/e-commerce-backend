import AppError from "../utils/AppError.util.js";
import { ProductType } from "@prisma/client";
import { categoryRepository } from "../repositories/category.repository.js";
import { brandRepository } from "../repositories/brand.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import {
  ProductCreateData,
  ProductUpdateData,
  GetProductsQuery,
} from "../types/product.types.js";
import { traderProfileRepository } from "../repositories/traderProfile.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";

// ─── Type-Specific Validators ─────────────────────────────────────────────

function validateShopType(data: Partial<ProductCreateData> & { shopPrice?: number | null; isFlashDeals?: boolean; flashDealPrice?: number | null; flashDealEndsAt?: string | Date | null }) {
  if (!data.shopPrice || data.shopPrice <= 0) {
    throw new AppError("shopPrice is required and must be > 0 for SHOP products", 400);
  }

  if (data.isFlashDeals) {
    if (data.flashDealPrice === undefined || data.flashDealPrice === null) {
      throw new AppError("flashDealPrice is required when isFlashDeals is true", 400);
    }
    if (data.flashDealPrice <= 0) {
      throw new AppError("flashDealPrice must be greater than 0", 400);
    }
    if (data.flashDealPrice >= data.shopPrice) {
      throw new AppError("flashDealPrice must be less than shopPrice", 400);
    }
    if (!data.flashDealEndsAt) {
      throw new AppError("flashDealEndsAt is required when isFlashDeals is true", 400);
    }
    const endsAt = new Date(data.flashDealEndsAt);
    if (Number.isNaN(endsAt.getTime())) {
      throw new AppError("flashDealEndsAt is not a valid date", 400);
    }
    if (endsAt.getTime() <= Date.now()) {
      throw new AppError("flashDealEndsAt must be in the future", 400);
    }
  }
}

function validateRetailType(data: Partial<ProductCreateData>) {
  if (!data.retailPrice || data.retailPrice <= 0) {
    throw new AppError("retailPrice is required and must be > 0 for RETAIL products", 400);
  }
  if (data.depositAmount === undefined || data.depositAmount === null) {
    throw new AppError("depositAmount is required for RETAIL products", 400);
  }
  if (data.depositAmount <= 0) {
    throw new AppError("depositAmount must be > 0", 400);
  }
  if (data.securityDeposit === undefined || data.securityDeposit === null) {
    throw new AppError("securityDeposit is required for RETAIL products", 400);
  }
  if (data.securityDeposit <= 0) {
    throw new AppError("securityDeposit must be > 0", 400);
  }
}

function validateWholesaleType(data: Partial<ProductCreateData>) {
  if (!data.wholesalePrice || data.wholesalePrice <= 0) {
    throw new AppError("wholesalePrice is required and must be > 0 for WHOLESALE products", 400);
  }
}

function validateBlankType(data: Partial<ProductCreateData>) {
  if (!data.materials || data.materials.length === 0) {
    throw new AppError("materials are required for BLANK products (at least 1)", 400);
  }
}

/**
 * Runs all type-specific validations for the given productTypes.
 */
function runTypeValidations(types: ProductType[], data: Partial<ProductCreateData>) {
  for (const type of types) {
    switch (type) {
      case ProductType.SHOP:
        validateShopType(data as any);
        break;
      case ProductType.RETAIL:
        validateRetailType(data);
        break;
      case ProductType.WHOLESALE:
        validateWholesaleType(data);
        break;
      case ProductType.BLANK:
        validateBlankType(data);
        break;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function notifyRestock(productId: string, productName: string, images: any[]) {
  const prismaClient = (await import("../utils/prismaClient.js")).default;
  const imageUrl = images?.[0]?.url || null;

  // Handle all restock types
  for (const targetType of ["SHOP_RESTOCK", "RETAIL_RESTOCK", "WHOLESALE_RESTOCK"]) {
    const subscribers = await prismaClient.notifyMeSubscription.findMany({
      where: { targetType, targetId: productId, isActive: true },
    });

    if (subscribers.length === 0) continue;

    await prismaClient.userNotification.createMany({
      data: subscribers.map((sub) => ({
        userId: sub.userId,
        title: "Product Back in Stock!",
        message: `Great news! "${productName}" is now back in stock. Grab it before it's gone!`,
        type: "restock",
        productId,
        imageUrl,
      })),
    });

    await prismaClient.notifyMeSubscription.updateMany({
      where: { targetType, targetId: productId, isActive: true },
      data: { isActive: false },
    });
  }
}

// ─── Service ──────────────────────────────────────────────────────────────

export const productService = {
  // ── CREATE ────────────────────────────────────────────────────────────────

  async create(data: ProductCreateData) {
    const trader = await traderProfileRepository.findById(data.traderId);
    if (!trader) throw new AppError("Trader not found", 404);

    const isOnlyBlank = data.productTypes.length === 1 && data.productTypes[0] === ProductType.BLANK;
    if (!isOnlyBlank && (!data.categoryIds || data.categoryIds.length === 0)) {
      throw new AppError("At least one category is required", 400);
    }
    
    if (data.categoryIds && data.categoryIds.length > 0) {
      const categories = await Promise.all(data.categoryIds.map(id => categoryRepository.findById(id)));
      if (categories.some(c => !c)) throw new AppError("One or more categories not found", 404);
    }

    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);
      if (!brand) throw new AppError("Brand not found", 404);
    }

    // Run type-specific validations
    runTypeValidations(data.productTypes, data);

    // Clear flash deal fields if not a flash deal
    if (!data.isFlashDeals) {
      data.flashDealPrice = null;
      data.flashDealEndsAt = null;
    }

    const product = await productRepository.create(data);

    // Notify category subscribers
    if (data.categoryIds && data.categoryIds.length > 0 && product) {
      const typeLabel = data.productTypes.join("/");
      for (const catId of data.categoryIds) {
        const subscribers = await notificationRepository.getSubscribersForCategory(catId);
        if (subscribers.length > 0) {
          await notificationRepository.createMany(
            subscribers.map((s) => ({
              userId: s.userId,
              title: "New item in your collection",
              body: `"${(product as any).name}" was just added to a collection you follow. [${typeLabel}]`,
              imageUrl: (product as any).images?.[0]?.url ?? undefined,
              productId: (product as any).id,
              categoryId: catId,
            }))
          );
        }
      }
    }

    return product;
  },

  // ── GET ALL ───────────────────────────────────────────────────────────────

  async getAll(query: GetProductsQuery) {
    return productRepository.findAll(query);
  },

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────

  async getRecommendations(query: {
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
    return productRepository.findRecommendations(query);
  },

  // ── GET BY TRADER ─────────────────────────────────────────────────────────

  async getByTraderId(traderId: number, type?: ProductType) {
    return productRepository.findByTraderId(traderId, type);
  },

  // ── GET BY ID ─────────────────────────────────────────────────────────────

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  // ── UPDATE ────────────────────────────────────────────────────────────────

  async update(id: string, data: ProductUpdateData) {
    const product = await this.getById(id);

    if (data.traderId !== product.traderId) {
      throw new AppError("You are not authorized to update this product", 403);
    }

    if (data.categoryIds && data.categoryIds.length > 0) {
      const categories = await Promise.all(data.categoryIds.map(id => categoryRepository.findById(id)));
      if (categories.some(c => !c)) throw new AppError("One or more categories not found", 404);
    }

    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);
      if (!brand) throw new AppError("Brand not found", 404);
    }

    // Determine effective types for validation
    const effectiveTypes: ProductType[] = data.productTypes
      ? data.productTypes
      : product.productTypes.map((pt: any) => pt.type as ProductType);

    // Build merged data for validation
    const mergedData = { ...product, ...data };
    runTypeValidations(effectiveTypes, mergedData as any);

    // Flash deal cleanup
    const finalIsFlashDeals =
      data.isFlashDeals !== undefined ? data.isFlashDeals : product.isFlashDeals;
    if (finalIsFlashDeals === false) {
      data.flashDealPrice = null;
      data.flashDealEndsAt = null;
    }

    const oldStock = product.stock ?? 0;
    const newStock = data.stock !== undefined ? data.stock : oldStock;

    const updated = await productRepository.update(id, data);

    // Restock notification
    if (oldStock <= 0 && newStock > 0) {
      await notifyRestock(id, product.name, product.images);
    }

    return updated;
  },

  // ── DELETE ────────────────────────────────────────────────────────────────

  /**
   * Smart delete:
   * - If `type` is provided AND product has >1 types → remove only that type
   * - Otherwise → delete the entire product
   */
  async delete(id: string, traderId: number, type?: ProductType) {
    const product = await this.getById(id);

    if (traderId !== product.traderId) {
      throw new AppError("You are not authorized to delete this product", 403);
    }

    if (type) {
      const result = await productRepository.removeProductType(id, type);
      return result;
    }

    return productRepository.delete(id);
  },
};
