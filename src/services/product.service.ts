
import AppError from "../utils/AppError.util.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { productRatingRepository } from "../repositories/productRating.repository.js";
import { ProductCreateData, ProductUpdateData } from "../types/product.types.js";


export const productService = {
  async create(data: ProductCreateData) {
    const category = await categoryRepository.findById(data.categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return productRepository.create(data);
  },

  async getAll(query: { search?: string; categoryId?: string }) {
    return productRepository.findAll(query);
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  },

  async update(id: string, data: ProductUpdateData) {
    await this.getById(id);

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    return productRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return productRepository.delete(id);
  },

  async rateProduct(userId: number, productId: string, rating: number) {
    await this.getById(productId);

    const existingRating = await productRatingRepository.findByUserAndProduct(
      userId,
      productId
    );

    if (existingRating) {
      await productRatingRepository.update(existingRating.id, { rating });
    } else {
      await productRatingRepository.create({
        userId,
        productId,
        rating,
      });
    }

    const average = await productRatingRepository.averageRating(productId);
    const averageRating = average._avg.rating ?? 0;

    await productRepository.update(productId, {
      rating: averageRating,
    });

    return {
      productId,
      userId,
      rating,
      averageRating,
    };
  },
};