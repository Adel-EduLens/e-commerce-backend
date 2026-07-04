import AppError from '../utils/AppError.util.js'
import { helpRepository } from '../repositories/help.repository.js'

export const helpService = {
  async getHelpSummary() {
    const [categories, faqs] = await Promise.all([
      helpRepository.findCategories(),
      helpRepository.findFaqs({}),
    ])

    return {
      categories,
      faqs,
    }
  },

  async getCategories() {
    return helpRepository.findCategories()
  },

  async getFaqs(query: Record<string, any>) {
    const categoryId = typeof query.categoryId === 'string' ? query.categoryId : undefined
    const search = typeof query.search === 'string' ? query.search.trim() : undefined

    return helpRepository.findFaqs({
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { search } : {}),
    })
  },

  async getFaqById(id: number) {
    const faq = await helpRepository.findFaqById(id)

    if (!faq) {
      throw new AppError('FAQ not found', 404)
    }

    return faq
  },
}
