
import AppError from "../utils/AppError.util.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { productRepository } from "../repositories/product.repository.js";
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
};