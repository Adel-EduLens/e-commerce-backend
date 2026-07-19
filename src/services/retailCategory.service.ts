import { RetailCategoryRepository } from "../repositories/retailCategory.repository.js";
import AppError from "../utils/AppError.util.js";

const retailCategoryRepository = new RetailCategoryRepository();

export class RetailCategoryService {
  async getAllCategories() {
    return retailCategoryRepository.findAll();
  }

  async getCategoryById(id: string) {
    const category = await retailCategoryRepository.findById(id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  }

  async createCategory(data: {
    name: string;
    image?: string;
    appearOnHome?: boolean;
  }) {
    const existing = await retailCategoryRepository.findByName(data.name);

    if (existing) {
      throw new AppError("Category already exists", 400);
    }

    return retailCategoryRepository.create(data);
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      image: string;
      appearOnHome: boolean;
    }>
  ) {
    const category = await retailCategoryRepository.findById(id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (data.name && data.name !== category.name) {
      const existing = await retailCategoryRepository.findByName(data.name);

      if (existing) {
        throw new AppError("Category already exists", 400);
      }
    }

    return retailCategoryRepository.update(id, data);
  }

  async deleteCategory(id: string) {
    const category = await retailCategoryRepository.findById(id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return retailCategoryRepository.delete(id);
  }
}
