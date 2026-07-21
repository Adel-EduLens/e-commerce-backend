import { recommendRepository } from '../repositories/recommend.repository.js'
import prismaClient from '../utils/prismaClient.js'

const SIGNAL_WEIGHTS: Record<string, number> = {
  view: 1,
  purchase: 3,
}

export const recommendService = {
  async addSignal(userId: number, productId: string, categoryId: string, type: string) {
    return recommendRepository.addSignal(userId, productId, categoryId, type)
  },

  async getSignals(userId: number) {
    return recommendRepository.getSignals(userId)
  },

  async clearSignals(userId: number) {
    return recommendRepository.clearSignals(userId)
  },

  async getTopCategories(userId: number, limit = 3) {
    // 1. Fetch user's recently viewed products ordered by viewedAt desc
    const recentlyViewed = await prismaClient.recentlyViewedProduct.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 10,
    })

    const categories = new Set<string>()

    for (const item of recentlyViewed) {
      let categoryId: string | null = null

      const product = await prismaClient.product.findUnique({
        where: { id: item.productId },
        select: { categories: { select: { id: true }, take: 1 } },
      })
      if (product?.categories?.[0]?.id) {
        categoryId = product.categories[0].id
      }

      if (categoryId) {
        categories.add(categoryId)
        if (categories.size >= limit) {
          break
        }
      }
    }

    // 2. If we found categories from recently viewed products, return them
    if (categories.size > 0) {
      return Array.from(categories)
    }

    // 3. Fallback: query user's explicit recommend signals
    const signals = await recommendRepository.getSignals(userId)

    if (!signals.length) {
      return []
    }

    const scores: Record<string, number> = {}

    for (const signal of signals) {
      const weight = SIGNAL_WEIGHTS[signal.type] || 1
      scores[signal.categoryId] = (scores[signal.categoryId] || 0) + weight
    }

    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([catId]) => catId)
  },
}
