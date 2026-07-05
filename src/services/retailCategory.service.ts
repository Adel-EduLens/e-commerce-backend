import { RetailCategoryRepository } from '../repositories/retailCategory.repository.js'
import AppError from '../utils/AppError.util.js'

const retailCategoryRepository = new RetailCategoryRepository()

export class RetailCategoryService {
  async getAllCategories() {
    return retailCategoryRepository.findAll()
  }

  async getCategoryById(id: number) {
    const category = await retailCategoryRepository.findById(id)
    if (!category) {
      throw new AppError('Category not found', 404)
    }
    return category
  }

  async getCategoryBySlug(slug: string) {
    const category = await retailCategoryRepository.findBySlug(slug)
    if (!category) {
      throw new AppError('Category not found', 404)
    }
    return category
  }

  async createCategory(data: { name: string; slug: string; description?: string; imageUrl?: string; isActive?: boolean }) {
    // Validate slug uniqueness
    const existing = await retailCategoryRepository.existsBySlug(data.slug)
    if (existing) {
      throw new AppError('Slug already exists', 400)
    }

    return retailCategoryRepository.create(data)
  }

  async updateCategory(id: number, data: Partial<{ name: string; slug: string; description: string; imageUrl: string; isActive: boolean }>) {
    const category = await retailCategoryRepository.findById(id)
    if (!category) {
      throw new AppError('Category not found', 404)
    }

    // Validate slug uniqueness if slug is being updated
    if (data.slug && data.slug !== category.slug) {
      const existing = await retailCategoryRepository.existsBySlug(data.slug, id)
      if (existing) {
        throw new AppError('Slug already exists', 400)
      }
    }

    return retailCategoryRepository.update(id, data)
  }

  async deleteCategory(id: number) {
    const category = await retailCategoryRepository.findById(id)
    if (!category) {
      throw new AppError('Category not found', 404)
    }

    return retailCategoryRepository.delete(id)
  }
}
