
import AppError from "../utils/AppError.util.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { ProductCreateData, ProductUpdateData } from "../types/product.types.js";
import { traderProfileRepository } from "../repositories/traderProfile.repository.js";


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

    return productRepository.create({ ...data });
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
    const product=await this.getById(id);
    
    if(data.traderId!==product.traderId){
      throw new AppError("You are not authorized to update this product", 403);
    }
    
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);

      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    return productRepository.update(id, data);
  },

  async delete(id: string,traderId:number) {
    const product=await this.getById(id);
    if(traderId!==product.traderId){
      throw new AppError("You are not authorized to delete this product", 403);
    }
    return productRepository.delete(id);
  },
};