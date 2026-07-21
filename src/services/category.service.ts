import { categoryRepository } from "../repositories/category.repository.js";
import AppError from "../utils/AppError.util.js";

interface CreateCategoryData {
  name: string;
  image?: string;
  appearOnHome?: boolean;
  isWholesale?: boolean;
  isRetail?: boolean;
  isShop?: boolean;
}

interface UpdateCategoryData {
  name?: string;
  image?: string;
  appearOnHome?: boolean;
  isWholesale?: boolean;
  isRetail?: boolean;
  isShop?: boolean;
}

export const categoryService = {
  async create(data: CreateCategoryData) {
    // Unique combination check based on name + isWholesale + isRetail + isShop
    const isWholesale = data.isWholesale ?? false;
    const isRetail = data.isRetail ?? false;
    const isShop = data.isShop ?? false;

    const exist = await categoryRepository.findAll({ isWholesale, isRetail, isShop });
    if (exist.some((c) => c.name === data.name)) {
      throw new AppError("Category with this name and type combination already exists", 409);
    }

    return categoryRepository.create(data);
  },

  async getAll(filters?: { isWholesale?: boolean; isRetail?: boolean; isShop?: boolean }) {
    return categoryRepository.findAll(filters);
  },

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);
    return category;
  },

  async update(id: string, data: UpdateCategoryData) {
    const existing = await this.getById(id);

    if (data.name !== undefined || data.isWholesale !== undefined || data.isRetail !== undefined || data.isShop !== undefined) {
      const name = data.name ?? existing.name;
      const isWholesale = data.isWholesale ?? existing.isWholesale;
      const isRetail = data.isRetail ?? existing.isRetail;
      const isShop = data.isShop ?? existing.isShop;

      const sameNameAndType = await categoryRepository.findAll({ isWholesale, isRetail, isShop });
      if (sameNameAndType.some((c) => c.name === name && c.id !== id)) {
        throw new AppError("Category with this name and type combination already exists", 409);
      }
    }

    return categoryRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);

    const usage = await categoryRepository.getCategoryUsage(id);

    if (usage.products > 0) {
      throw new AppError(
        `Cannot delete category. It has ${usage.products} product(s) assigned to it. Please reassign or delete all products first.`,
        400
      );
    }

    return categoryRepository.delete(id);
  },
};
