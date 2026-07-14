import { retailProductRepository } from "../repositories/retailProduct.repository.js";
import AppError from "../utils/AppError.util.js";
import prismaClient from "../utils/prismaClient.js";

import { traderProfileRepository } from "../repositories/traderProfile.repository.js";

async function notifyRetailRestock(
  productId: number,
  productName: string,
  imageUrl?: string,
) {
  const subscribers = await prismaClient.notifyMeSubscription.findMany({
    where: {
      targetType: "RETAIL_RESTOCK",
      targetId: String(productId),
      isActive: true,
    },
  });

  if (subscribers.length === 0) return;

  await prismaClient.userNotification.createMany({
    data: subscribers.map((s) => ({
      userId: s.userId,
      title: "Retail Product Back in Stock!",
      message: `Great news! "${productName}" is now back in stock. Grab it before it's gone!`,
      type: "restock",
      productId: String(productId),
      imageUrl: imageUrl ?? null,
      productId: String(productId),
    })),
  });

  await prismaClient.notifyMeSubscription.updateMany({
    where: {
      targetType: "RETAIL_RESTOCK",
      targetId: String(productId),
      isActive: true,
    },

    data: {
      isActive: false,
    },
  });
}

export const retailProductService = {
  async create(data: any) {
    const trader = await traderProfileRepository.findById(data.traderId);

    if (!trader) {
      throw new AppError("Trader not found", 404);
    }

    const category = await retailProductRepository.categoryExists(
      data.categoryId,
    );

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (data.brandId) {
      const brand = await retailProductRepository.brandExists(data.brandId);

      if (!brand) {
        throw new AppError("Brand not found", 404);
      }
    }

    return retailProductRepository.create(data);
  },

  async getAll(query: any) {
    return retailProductRepository.findAll(query);
  },

  async getRecommendations(query: any) {
    return retailProductRepository.findRecommendations(query);
  },

  async getByTraderId(traderId: number) {
    return retailProductRepository.findByTraderId(traderId);
  },

  async getById(id: number) {
    const product = await retailProductRepository.findById(id);

    if (!product) {
      throw new AppError("Retail product not found", 404);
    }

    return product;
  },

  async update(id: number, data: any) {
    const product = await this.getById(id);

    if (data.traderId !== product.traderId) {
      throw new AppError("You are not authorized to update this product", 403);
    }

    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await retailProductRepository.categoryExists(
        data.categoryId,
      );

      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    if (data.brandId) {
      const brand = await retailProductRepository.brandExists(data.brandId);

      if (!brand) {
        throw new AppError("Brand not found", 404);
      }
    }

    const oldStock = product.stock ?? 0;

    const newStock = data.stock !== undefined ? data.stock : oldStock;

    const updatedProduct = await retailProductRepository.update(id, data);

    // Notification logic kept as it is

    if (oldStock <= 0 && newStock > 0) {
      const imageUrl = product.images?.[0]?.url;

      await notifyRetailRestock(id, product.name, imageUrl);
    }

    return updatedProduct;
  },

  async delete(id: number, traderId: number) {
    const product = await this.getById(id);

    if (product.traderId !== traderId) {
      throw new AppError("You are not authorized to delete this product", 403);
    }

    return retailProductRepository.delete(id);
  },
};
