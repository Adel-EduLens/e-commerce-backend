import AppError from "../utils/AppError.util.js";
import { productRepository } from "../repositories/product.repository.js";
import { reviewRepository } from "../repositories/review.repository.js";
import {
  ReviewCreateData,
  ReviewUpdateData,
} from "../types/review.types.js";


export const reviewService = {
  async updateProductRating(productId: string) {
    const averageRating = await reviewRepository.getAverageRating(productId);

    await productRepository.updateRating(
      productId,
      Number(averageRating.toFixed(1)),
    );
  },

  async create(data :ReviewCreateData ) {
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

    const review = await reviewRepository.create(data);
    await this.updateProductRating(data.productId);
    return review;
  },

  async getByProduct(productId: string) {
    const product = await productRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return reviewRepository.findAllByProduct(productId);
  },

  async update(id: string, data :ReviewUpdateData ) {
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== data.userId) {
      throw new AppError("You are not authorized to update this review", 403);
    }

    const updatedReview = await reviewRepository.update(id, data);
    await this.updateProductRating(review.productId);
    return updatedReview;
  },

  async delete(id: string, userId: number) {
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== userId) {
      throw new AppError("You are not authorized to delete this review", 403);
    }
    const result=await reviewRepository.delete(id);
    await this.updateProductRating(review.productId);
    return result;
  },
};
