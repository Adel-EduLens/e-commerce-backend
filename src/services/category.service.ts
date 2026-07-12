import { categoryRepository } from "../repositories/category.repository.js";
import AppError from "../utils/AppError.util.js";

interface CreateCategoryData {
  name: string;
  image: string;
  appearOnHome?: boolean;
}

interface UpdateCategoryData {
  name?: string;
  image?: string;
  appearOnHome?: boolean;
}

export const categoryService = {
  async create(data: CreateCategoryData) {
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

  async update(id: string, data: UpdateCategoryData) {
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

    const usage = await categoryRepository.getCategoryUsage(id);

    if (usage.products > 0 || usage.wholesales > 0 || usage.coupons > 0) {
      throw new AppError(
        `Cannot delete category. It is used by ${
          usage.products > 0 ? `${usage.products} products, ` : ""
        }${usage.wholesales > 0 ? `${usage.wholesales} wholesales, ` : ""}${
          usage.coupons > 0 ? `${usage.coupons} coupons` : ""
        }`,
        400
      );
    }
    return categoryRepository.delete(id);
  },
};
