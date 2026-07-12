import { wishlistRepository } from '../repositories/wishlist.repository.js'
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

export class WishlistService {
  async getWishlist(userId: number) {
    const items = await wishlistRepository.findByUser(userId)

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
          createdAt: item.createdAt,
        }
      })
    )

    return enriched
  }

  async getStatus(userId: number, productType: string, productId: string) {
    const item = await wishlistRepository.findOne(userId, productType, productId)
    return { isWishlisted: !!item }
  }

  async toggle(userId: number, productType: string, productId: string) {
    const existing = await wishlistRepository.findOne(userId, productType, productId)

    if (existing) {
      await wishlistRepository.delete(userId, productType, productId)
      return { isWishlisted: false, action: 'removed' }
    }

    await wishlistRepository.create(userId, productType, productId)
    return { isWishlisted: true, action: 'added' }
  }
}

export const wishlistService = new WishlistService()
