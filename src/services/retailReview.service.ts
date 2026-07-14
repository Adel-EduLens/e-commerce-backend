import prisma from "../utils/prismaClient.js";
import AppError from "../utils/AppError.util.js";

import { retailReviewRepository } from "../repositories/retailReview.repository.js";

import {
  RetailReviewCreateData,
  RetailReviewUpdateData,
} from "../types/retailReview.types.js";

export const retailReviewService = {
  async updateProductRating(retailProductId: number, tx: any) {
    const average = await retailReviewRepository.getAverageRating(
      retailProductId,
      tx,
    );

    await tx.retailProduct.update({
      where: {
        id: retailProductId,
      },

      data: {
        rating: Number(average.toFixed(1)),
      },
    });
  },

  async create(data: RetailReviewCreateData) {
    const product = await prisma.retailProduct.findUnique({
      where: {
        id: data.retailProductId,
      },
    });

    if (!product) {
      throw new AppError("Retail product not found", 404);
    }

    const exists = await retailReviewRepository.findByUserAndProduct(
      data.userId,
      data.retailProductId,
    );

    if (exists) {
      throw new AppError("You already reviewed this product", 409);
    }

    return prisma.$transaction(async (tx) => {
      const review = await retailReviewRepository.create(data, tx);

      await this.updateProductRating(data.retailProductId, tx);

      return review;
    });
  },

  async getByProduct(retailProductId: number) {
    const product = await prisma.retailProduct.findUnique({
      where: {
        id: retailProductId,
      },
    });

    if (!product) {
      throw new AppError("Retail product not found", 404);
    }

    return retailReviewRepository.findAllByProduct(retailProductId);
  },

  async update(id: string, data: RetailReviewUpdateData) {
    const review = await retailReviewRepository.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== data.userId) {
      throw new AppError("Not authorized", 403);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await retailReviewRepository.update(id, data, tx);

      await this.updateProductRating(review.retailProductId, tx);

      return updated;
    });
  },

  async delete(id: string, userId: number) {
    const review = await retailReviewRepository.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== userId) {
      throw new AppError("Not authorized", 403);
    }

    return prisma.$transaction(async (tx) => {
      const result = await retailReviewRepository.delete(id, tx);

      await this.updateProductRating(review.retailProductId, tx);

      return result;
    });
  },
};
