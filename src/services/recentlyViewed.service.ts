import { recentlyViewedRepository } from '../repositories/recentlyViewed.repository.js'
import prismaClient from '../utils/prismaClient.js'

const RETAIL_INCLUDE = {
  images: true,
  colors: true,
  sizes: true,
  category: true,
}

const WHOLESALE_INCLUDE = {
  images: true,
  wholesaleColors: {
    include: {
      sizes: true,
    },
  },
  category: true,
}

const SHOP_INCLUDE = {
  images: true,
  colors: true,
  sizes: true,
  category: true,
  brand: true,
}

export class RecentlyViewedService {
  async getRecentlyViewed(userId: number) {
    const items = await recentlyViewedRepository.findByUser(userId)

    const enriched = await Promise.all(
      items.map(async (item) => {
        let product = null

        if (item.productType === 'RETAIL') {
          product = await prismaClient.retailProduct.findUnique({
            where: { id: Number(item.productId) },
            include: RETAIL_INCLUDE,
          })
        } else if (item.productType === 'WHOLESALE') {
          product = await prismaClient.wholesale.findUnique({
            where: { id: item.productId },
            include: WHOLESALE_INCLUDE,
          })
        } else if (item.productType === 'SHOP') {
          product = await prismaClient.product.findUnique({
            where: { id: item.productId },
            include: SHOP_INCLUDE,
          })
        }

        return {
          id: item.id,
          productType: item.productType,
          productId: item.productId,
          product,
          viewedAt: item.viewedAt,
        }
      })
    )

    // filter out items where product might have been deleted
    return enriched.filter((item) => item.product !== null)
  }

  async addViewedProduct(userId: number, productType: string, productId: string) {
    return await recentlyViewedRepository.addOrUpdate(userId, productType, productId)
  }
}

export const recentlyViewedService = new RecentlyViewedService()
