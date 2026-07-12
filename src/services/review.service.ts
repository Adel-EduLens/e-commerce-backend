import AppError from "../utils/AppError.util.js";
import { productRepository } from "../repositories/product.repository.js";
import { reviewRepository } from "../repositories/review.repository.js";
import { ReviewCreateData, ReviewUpdateData } from "../types/review.types.js";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prismaClient.js";
type Transaction = Prisma.TransactionClient;

export const reviewService = {
  async updateProductRating(productId: string, tx: Transaction) {
    const averageRating = await reviewRepository.getAverageRating(
      productId,
      tx,
    );

    await productRepository.updateRating(
      productId,
      Number(averageRating.toFixed(1)),
      tx,
    );
  },

  async create(data: ReviewCreateData) {
    const product = await productRepository.findById(data.productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existingReview = await reviewRepository.findByUserAndProduct(
      data.userId,
      data.productId,
    );

    if (existingReview) {
      throw new AppError("You have already reviewed this product", 409);
    }

    return prisma.$transaction(async (tx) => {
      const review = await reviewRepository.create(data, tx);

      await this.updateProductRating(data.productId, tx);

      return review;
    });
  },

  async getByProduct(productId: string) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return reviewRepository.findAllByProduct(productId);
  },

  async update(id: string, data: ReviewUpdateData) {
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== data.userId) {
      throw new AppError("You are not authorized to update this review", 403);
    }

    return prisma.$transaction(async (tx) => {
      const updatedReview = await reviewRepository.update(id, data, tx);

      await this.updateProductRating(review.productId, tx);

      return updatedReview;
    });
  },

  async delete(id: string, userId: number) {
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== userId) {
      throw new AppError("You are not authorized to delete this review", 403);
    }
    return prisma.$transaction(async (tx) => {
      const result = await reviewRepository.delete(id, tx);

      await this.updateProductRating(review.productId, tx);

      return result;
    });
  },
};
