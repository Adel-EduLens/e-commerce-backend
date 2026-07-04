import { categoryRepository } from "../repositories/category.repository.js";
import AppError from "../utils/AppError.util.js";

interface CategoryData {
  name: string;
}

export const categoryService = {
  async create(data: CategoryData) {
    const exist = await categoryRepository.findByName(data.name);

    if (exist) {
      throw new AppError("Category already exists", 409);
    }

    return categoryRepository.create(data);
  },

  async getAll() {
    return categoryRepository.findAll();
  },

  async getById(id: string) {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  },

  async update(id: string, data: CategoryData) {
    await this.getById(id);

    if (data.name) {
      const exist = await categoryRepository.findByName(data.name);

      if (exist && exist.id !== id) {
        throw new AppError("Category already exists", 409);
      }
    }

    return categoryRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);

    const productsCount = await categoryRepository.hasProducts(id);

    if (productsCount > 0) {
      throw new AppError(
        "Cannot delete category that contains products",
        400
      );
    }

    return categoryRepository.delete(id);
  }
};
