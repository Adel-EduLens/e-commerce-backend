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

      if (item.productType === 'RETAIL') {
        const product = await prismaClient.retailProduct.findUnique({
          where: { id: Number(item.productId) },
          select: { categoryId: true },
        })
        if (product) categoryId = String(product.categoryId)
      } else if (item.productType === 'WHOLESALE') {
        const product = await prismaClient.wholesale.findUnique({
          where: { id: item.productId },
          select: { categoryId: true },
        })
        if (product) categoryId = product.categoryId
      } else if (item.productType === 'SHOP') {
        const product = await prismaClient.product.findUnique({
          where: { id: item.productId },
          select: { categoryId: true },
        })
        if (product) categoryId = product.categoryId
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

    // 3. Fallback to weights from signal table if recently viewed is empty
    const signals = await recommendRepository.getSignals(userId)
    const weights = new Map<string, number>()

    for (const signal of signals) {
      const w = SIGNAL_WEIGHTS[signal.type] ?? 0
      weights.set(
        signal.categoryId,
        (weights.get(signal.categoryId) ?? 0) + w
      )
    }

    return [...weights.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([categoryId]) => categoryId)
  },

  async clearSignals(userId: number) {
    return recommendRepository.clearSignals(userId)
  },
}
