import AppError from "../utils/AppError.util.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { brandRepository } from "../repositories/brand.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import {
  ProductCreateData,
  ProductUpdateData,
} from "../types/product.types.js";
import { traderProfileRepository } from "../repositories/traderProfile.repository.js";
import { notificationRepository } from "../repositories/notification.repository.js";

type GetProductsQuery = {

  search?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  traderId?: number | undefined;
  filter?: string;
  size?: string;
  color?: string;
  priceMin?: number | undefined;
  priceMax?: number | undefined;

  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;

  page?: number | undefined;
  limit?: number | undefined;
};

function validateFlashDeal({
  isFlashDeals,
  price,
  flashDealPrice,
  flashDealEndsAt,
}: {
  isFlashDeals: boolean;
  price: number;
  flashDealPrice?: number | null | undefined;
  flashDealEndsAt?: Date | null | undefined;
}) {
  if (!isFlashDeals) return;

  if (flashDealPrice === undefined || flashDealPrice === null) {
    throw new AppError(
      "flashDealPrice is required when isFlashDeals is true",
      400
    );
  }

  if (flashDealPrice <= 0) {
    throw new AppError("flashDealPrice must be greater than 0", 400);
  }

  if (flashDealPrice >= price) {
    throw new AppError(
      "flashDealPrice must be less than the product's price",
      400
    );
  }

  if (!flashDealEndsAt) {
    throw new AppError(
      "flashDealEndsAt is required when isFlashDeals is true",
      400
    );
  }

  const endsAt = new Date(flashDealEndsAt);

  if (Number.isNaN(endsAt.getTime())) {
    throw new AppError("flashDealEndsAt is not a valid date", 400);
  }

  if (endsAt.getTime() <= Date.now()) {
    throw new AppError("flashDealEndsAt must be in the future", 400);
  }
}

export const productService = {
  async create(data: ProductCreateData) {
  const trader = await traderProfileRepository.findById(data.traderId);

  if (!trader) {
    throw new AppError("Trader not found", 404);
  }

  const category = await categoryRepository.findById(data.categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (data.brandId) {
    const brand = await brandRepository.findById(data.brandId);

    if (!brand) {
      throw new AppError("Brand not found", 404);
    }
  }

  validateFlashDeal({
    isFlashDeals: !!data.isFlashDeals,
    price: data.price,
    flashDealPrice: data.flashDealPrice,
    flashDealEndsAt: data.flashDealEndsAt
      ? new Date(data.flashDealEndsAt)
      : null,
  });

  if (!data.isFlashDeals) {
    delete data.flashDealPrice;
    delete data.flashDealEndsAt;
  }

  const product = await productRepository.create(data);

  // Notify subscribers of this category
  if (data.categoryId) {
    const subscribers = await notificationRepository.getSubscribersForCategory(data.categoryId)
    if (subscribers.length > 0) {
      await notificationRepository.createMany(
        subscribers.map(s => ({
          userId: s.userId,
          title: 'New item in your collection',
          body: `"${product.name}" was just added to a collection you follow.`,
          imageUrl: (product as any).images?.[0]?.url ?? undefined,
          productId: product.id,
          categoryId: data.categoryId,
        }))
      )
    }
  }

  return product;
},

  async getAll(query: GetProductsQuery) {
    return productRepository.findAll(query);
  },

  async getFilters() {
    return productRepository.getFilters();
  },

  async getByTraderId(traderId: number) {
    return productRepository.findByTraderId(traderId);
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  },

  async update(id: string, data: ProductUpdateData) {
    const product = await this.getById(id);

    if (data.traderId !== product.traderId) {
      throw new AppError(
        "You are not authorized to update this product",
        403
      );
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);

      if (!brand) {
        throw new AppError("Brand not found", 404);
      }
    }

    const finalIsFlashDeals =
      data.isFlashDeals !== undefined ? data.isFlashDeals : product.isFlashDeals;

    const finalPrice = data.price !== undefined ? data.price : product.price;

    const finalFlashDealPrice =
      data.flashDealPrice !== undefined
        ? data.flashDealPrice
        : product.flashDealPrice;

    const finalFlashDealEndsAt =
      data.flashDealEndsAt !== undefined
        ? data.flashDealEndsAt
          ? new Date(data.flashDealEndsAt)
          : null
        : product.flashDealEndsAt;

    validateFlashDeal({
      isFlashDeals: finalIsFlashDeals,
      price: finalPrice,
      flashDealPrice: finalFlashDealPrice,
      flashDealEndsAt: finalFlashDealEndsAt,
    });

 
    if (finalIsFlashDeals === false) {
      data.flashDealPrice = null;
      data.flashDealEndsAt = null;
    }

    return productRepository.update(id, data);
  },

  async delete(id: string, traderId: number) {
    const product = await this.getById(id);

    if (traderId !== product.traderId) {
      throw new AppError(
        "You are not authorized to delete this product",
        403
      );
    }

    return productRepository.delete(id);
  },
};