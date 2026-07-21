import { recentlyViewedRepository } from '../repositories/recentlyViewed.repository.js'
import prismaClient from '../utils/prismaClient.js'

export class RecentlyViewedService {
  async getRecentlyViewed(userId: number) {
    const items = await recentlyViewedRepository.findByUser(userId)

    const productIds = items.map((item) => item.productId)

    const products = productIds.length > 0
      ? await prismaClient.product.findMany({
          where: { id: { in: productIds } },
          include: {
            images: true,
            colors: {
              include: {
                sizes: true,
              },
            },
            sizes: true,
            categories: true,
            brand: true,
          },
        })
      : []

    const productMap = new Map(products.map((p) => [p.id, p]))

    const enriched = items.map((item) => {
      const product = productMap.get(item.productId) || null
      return {
        id: item.id,
        productType: item.productType,
        productId: item.productId,
        product,
        viewedAt: item.viewedAt,
      }
    })

    // filter out items where product might have been deleted
    return enriched.filter((item) => item.product !== null)
  }

  async addViewedProduct(userId: number, productType: string, productId: string) {
    return await recentlyViewedRepository.addOrUpdate(userId, productType, productId)
  }
}

export const recentlyViewedService = new RecentlyViewedService()
