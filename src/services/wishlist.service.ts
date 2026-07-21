import { wishlistRepository } from '../repositories/wishlist.repository.js'
import prismaClient from '../utils/prismaClient.js'

const PRODUCT_INCLUDE = {
  images: true,
  colors: {
    include: {
      sizes: true,
    },
  },
  sizes: true,
  categories: true,
  brand: true,
}

export class WishlistService {
  async getWishlist(userId: number) {
    const items = await wishlistRepository.findByUser(userId)

    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await prismaClient.product.findUnique({
          where: { id: item.productId },
          include: PRODUCT_INCLUDE,
        })

        // Map unified 'categories' back to 'category' and 'colors' to 'wholesaleColors' 
        // to maintain frontend compatibility until FavoritesPage is fully refactored.
        const mappedProduct = product ? {
          ...product,
          category: product.categories?.[0] || null,
          wholesaleColors: product.colors || [],
        } : null;

        return {
          id: item.id,
          productType: item.productType,
          productId: item.productId,
          product: mappedProduct,
          createdAt: item.createdAt,
        }
      })
    )

    return enriched
  }

  async getStatus(userId: number, productType: string, productId: string) {
    const item = await wishlistRepository.findByProductId(userId, productId)
    return { isWishlisted: !!item }
  }

  async toggle(userId: number, productType: string, productId: string) {
    const existing = await wishlistRepository.findByProductId(userId, productId)

    if (existing) {
      await wishlistRepository.deleteByProductId(userId, productId)
      return { isWishlisted: false, action: 'removed' }
    }

    await wishlistRepository.create(userId, productType, productId)
    return { isWishlisted: true, action: 'added' }
  }
}

export const wishlistService = new WishlistService()
