import AppError from "../utils/AppError.util.js";
import prisma from "../utils/prismaClient.js";
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

    // Check if stock is being restocked (was 0, now > 0)
    const oldStock = product.stock ?? 0;
    const newStock = data.stock !== undefined ? data.stock : oldStock;

    const updatedProduct = await productRepository.update(id, data);

    // If product was out of stock and now restocked, notify subscribers
    if (oldStock <= 0 && newStock > 0) {
      await this.notifyRestockSubscribers(id, product.name, product.colors?.[0]?.images || []);
    }

    return updatedProduct;
  },

  async notifyRestockSubscribers(productId: string, productName: string, images: any[]) {
    const { prisma } = await import('../utils/prismaClient.js');
    const subscribers = await prisma.notifyMeSubscription.findMany({
      where: { targetType: 'SHOP_RESTOCK', targetId: productId, isActive: true },
    });
    if (subscribers.length === 0) return;
    const imageUrl = images?.[0]?.url || null;
    await prisma.userNotification.createMany({
      data: subscribers.map((sub) => ({
        userId: sub.userId,
        title: 'Product Back in Stock!',
        message: `Great news! "${productName}" is now back in stock. Grab it before it's gone!`,
      })),
    });
    await prisma.notifyMeSubscription.updateMany({
      where: { targetType: 'SHOP_RESTOCK', targetId: productId, isActive: true },
      data: { isActive: false },
    });
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

  async getProductDetails(id: string, userId?: number) {
    const details = await productRepository.findDetailsById(id, userId);

    if (!details) {
      throw new AppError("Product not found", 404);
    }

    const { product, isFavorite } = details;

    // Calculate rating details
    const totalReviews = await prisma.review.count({ where: { productId: id } });
    const averageRatingAgg = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true }
    });
    const averageRating = averageRatingAgg._avg.rating ? Number(averageRatingAgg._avg.rating.toFixed(1)) : 0;

    // Calculate prices & discount (Flash Deals logic)
    let currentPrice = product.price;
    let oldPrice: number | null = null;
    let discountPercentage = 0;

    const now = new Date();
    if (product.isFlashDeals && product.flashDealPrice !== null && product.flashDealEndsAt && product.flashDealEndsAt > now) {
      currentPrice = product.flashDealPrice;
      oldPrice = product.price;
      discountPercentage = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
    }

    // Calculate total stock & addToCart state
    const totalStock = (product.colors || []).reduce(
      (sum: number, c: any) => sum + (c.variants || []).reduce((vSum: number, v: any) => vSum + v.quantity, 0),
      0
    );
    const canAddToCart = totalStock > 0;

    // Extract colors, variants, images
    const colorsData = (product.colors || []).map((c: any) => {
      return {
        id: c.id,
        name: c.colorName,
        colorName: c.colorName,
        hex: c.colorCode || "#000000",
        images: (c.images || []).map((img: any) => ({
          id: img.id,
          imageUrl: img.imageUrl,
        })),
        variants: (c.variants || []).map((v: any) => ({
          id: v.id,
          size: v.size,
          quantity: v.quantity,
        })),
      };
    });

    const images = (product.colors || []).flatMap((c: any) =>
      (c.images || []).map((img: any) => ({
        id: img.id,
        url: img.imageUrl,
        color: c.colorName,
      }))
    );

    const availableSizes = Array.from(
      new Set((product.colors || []).flatMap((c: any) => (c.variants || []).map((v: any) => v.size)))
    );

    // Get recommended products
    const recommendedRaw = await productRepository.findRecommended(id, product.categoryId, 8);
    const recommendedProducts = recommendedRaw.map((p: any) => {
      let rPrice = p.price;
      let rOldPrice: number | null = null;
      let rDiscountPercentage = 0;
      if (p.isFlashDeals && p.flashDealPrice !== null && p.flashDealEndsAt && p.flashDealEndsAt > now) {
        rPrice = p.flashDealPrice;
        const originalPrice = p.price;
        rOldPrice = originalPrice;
        rDiscountPercentage = Math.round(((originalPrice - rPrice) / originalPrice) * 100);
      }
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        price: rPrice,
        oldPrice: rOldPrice,
        discountPercentage: rDiscountPercentage,
        averageRating: p.rating,
        images: (p.colors || []).flatMap((c: any) =>
          (c.images || []).map((img: any) => ({
            id: img.id,
            url: img.imageUrl,
            color: c.colorName,
          }))
        ),
      };
    });

    // Mapped reviews
    const mappedReviews = (product.reviews || []).map((rev: any) => ({
      id: rev.id,
      user: {
        id: rev.user.id,
        name: rev.user.name,
        avatar: rev.user.avatar,
      },
      rating: rev.rating,
      comment: rev.comment,
      images: (rev.images || []).map((img: any) => img.url),
      createdAt: rev.createdAt,
      helpfulCount: rev.helpfulCount,
    }));

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: currentPrice,
      rating: product.rating,
      oldPrice,
      discountPercentage,
      averageRating,
      totalReviews,
      totalStock,
      canAddToCart,
      brand: product.brand
        ? {
          id: product.brand.id,
          name: product.brand.name,
          logo: (product.brand as any).logo || null,
        }
        : null,
      category: product.category
        ? {
          id: product.category.id,
          name: product.category.name,
        }
        : null,
      isFavorite,
      images,
      colors: colorsData,
      availableSizes,
      shipping: {
        freeReturns: true,
        estimatedDelivery: "Tomorrow",
      },
      reviews: {
        average: averageRating,
        total: totalReviews,
        list: mappedReviews,
      },
      recommendedProducts,
    };
  },

  async getProductRecommended(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError("Product not found", 404);

    const now = new Date();
    const recommendedRaw = await productRepository.findRecommended(id, product.categoryId, 8);
    return recommendedRaw.map((p: any) => {
      let rPrice = p.price;
      let rOldPrice: number | null = null;
      let rDiscountPercentage = 0;
      if (p.isFlashDeals && p.flashDealPrice !== null && p.flashDealEndsAt && p.flashDealEndsAt > now) {
        rPrice = p.flashDealPrice;
        const originalPrice = p.price;
        rOldPrice = originalPrice;
        rDiscountPercentage = Math.round(((originalPrice - rPrice) / originalPrice) * 100);
      }
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        shortDescription: p.shortDescription,
        price: rPrice,
        oldPrice: rOldPrice,
        discountPercentage: rDiscountPercentage,
        averageRating: p.rating,
        images: (p.colors || []).flatMap((c: any) =>
          (c.images || []).map((img: any) => ({
            id: img.id,
            url: img.imageUrl,
            color: c.colorName,
          }))
        ),
      };
    });
  },

  async getProductReviews(id: string, query: { page?: number; limit?: number; rating?: number; sort?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const rating = query.rating !== undefined ? Number(query.rating) : undefined;
    const sort = query.sort || "latest";

    const { reviewRepository } = await import("../repositories/review.repository.js");
    const queryObj: any = { page, limit };
    if (rating !== undefined) queryObj.rating = rating;
    if (sort !== undefined) queryObj.sort = sort;
    const result = await reviewRepository.findPaginatedReviews(id, queryObj);

    return {
      reviews: result.reviews.map((rev: any) => ({
        id: rev.id,
        user: {
          id: rev.user.id,
          name: rev.user.name,
          avatar: rev.user.avatar,
        },
        rating: rev.rating,
        comment: rev.comment,
        images: (rev.images || []).map((img: any) => img.url),
        createdAt: rev.createdAt,
        helpfulCount: rev.helpfulCount,
      })),
      pagination: result.pagination,
    };
  },
};