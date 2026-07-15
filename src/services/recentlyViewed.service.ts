import { recentlyViewedRepository } from '../repositories/recentlyViewed.repository.js'
import prismaClient from '../utils/prismaClient.js'
import { RetailProduct, Wholesale, Product } from '@prisma/client'

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

    const retailIds = items
      .filter((item) => item.productType === 'RETAIL')
      .map((item) => Number(item.productId))
    const wholesaleIds = items
      .filter((item) => item.productType === 'WHOLESALE')
      .map((item) => item.productId)
    const shopIds = items
      .filter((item) => item.productType === 'SHOP')
      .map((item) => item.productId)

    const [retailProducts, wholesaleProducts, shopProducts] = await Promise.all([
      retailIds.length > 0
        ? prismaClient.retailProduct.findMany({
            where: { id: { in: retailIds } },
            include: RETAIL_INCLUDE,
          })
        : [],
      wholesaleIds.length > 0
        ? prismaClient.wholesale.findMany({
            where: { id: { in: wholesaleIds } },
            include: WHOLESALE_INCLUDE,
          })
        : [],
      shopIds.length > 0
        ? prismaClient.product.findMany({
            where: { id: { in: shopIds } },
            include: SHOP_INCLUDE,
          })
        : [],
    ])

    const retailMap = new Map(retailProducts.map((p) => [p.id, p]))
    const wholesaleMap = new Map(wholesaleProducts.map((p) => [p.id, p]))
    const shopMap = new Map(shopProducts.map((p) => [p.id, p]))

    const enriched = items.map((item) => {
      let product: RetailProduct | Wholesale | Product | null = null

      if (item.productType === 'RETAIL') {
        product = retailMap.get(Number(item.productId)) || null
      } else if (item.productType === 'WHOLESALE') {
        product = wholesaleMap.get(item.productId) || null
      } else if (item.productType === 'SHOP') {
        product = shopMap.get(item.productId) || null
      }

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
