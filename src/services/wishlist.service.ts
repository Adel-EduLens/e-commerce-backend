import AppError from '../utils/AppError.util.js'
import { wishlistRepository } from '../repositories/wishlist.repository.js'
import { RetailProductRepository } from '../repositories/retailProduct.repository.js'
import { productRepository } from '../repositories/product.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import prisma from '../utils/prismaClient.js'
import type { WishlistProductType } from '@prisma/client'

const retailProductRepository = new RetailProductRepository()

export class WishlistService {
  async getWishlist(userId: number) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    return wishlistRepository.findManyByUserId(userId)
  }

  async getWishlistStatus(userId: number, productType: WishlistProductType, productId: string) {
    const parsed = this.parseProductId(productType, productId)
    await this.validateProductExists(productType, parsed)

    const existing = await wishlistRepository.findByUserTypeAndProductId(
      userId,
      productType,
      parsed.retailProductId,
      parsed.wholesaleProductId,
      parsed.shopProductId
    )

    return { isWishlisted: Boolean(existing) }
  }

  async toggleWishlist(userId: number, productType: WishlistProductType, productId: string) {
    const parsed = this.parseProductId(productType, productId)
    await this.validateProductExists(productType, parsed)

    const existing = await wishlistRepository.findByUserTypeAndProductId(
      userId,
      productType,
      parsed.retailProductId,
      parsed.wholesaleProductId,
      parsed.shopProductId
    )

    if (existing) {
      await wishlistRepository.deleteById(existing.id)
      return { isWishlisted: false, action: 'removed' }
    }

    await wishlistRepository.create({
      userId,
      productType,
      retailProductId: parsed.retailProductId,
      wholesaleProductId: parsed.wholesaleProductId,
      shopProductId: parsed.shopProductId,
    })

    return { isWishlisted: true, action: 'added' }
  }

  async deleteWishlist(userId: number, productType: WishlistProductType, productId: string) {
    const parsed = this.parseProductId(productType, productId)
    await this.validateProductExists(productType, parsed)

    const existing = await wishlistRepository.findByUserTypeAndProductId(
      userId,
      productType,
      parsed.retailProductId,
      parsed.wholesaleProductId,
      parsed.shopProductId
    )

    if (!existing) {
      throw new AppError('Wishlist item not found', 404)
    }

    await wishlistRepository.deleteById(existing.id)
    return { isWishlisted: false, action: 'removed' }
  }

  private parseProductId(productType: WishlistProductType, productId: string) {
    const parsed = {
      retailProductId: null as number | null,
      wholesaleProductId: null as number | null,
      shopProductId: null as string | null,
    }

    if (productType === 'RETAIL') {
      const id = Number(productId)
      if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('Invalid retail productId', 400)
      }
      parsed.retailProductId = id
      return parsed
    }

    if (productType === 'WHOLESALE') {
      const id = Number(productId)
      if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('Invalid wholesale productId', 400)
      }
      parsed.wholesaleProductId = id
      return parsed
    }

    if (productType === 'SHOP') {
      if (!productId || typeof productId !== 'string') {
        throw new AppError('Invalid shop productId', 400)
      }
      parsed.shopProductId = productId
      return parsed
    }

    throw new AppError('Invalid productType', 400)
  }

  private async validateProductExists(productType: WishlistProductType, parsed: {
    retailProductId: number | null
    wholesaleProductId: number | null
    shopProductId: string | null
  }) {
    if (productType === 'RETAIL') {
      const product = await retailProductRepository.findById(parsed.retailProductId!) 
      if (!product || !product.isActive) {
        throw new AppError('Retail product not found or inactive', 404)
      }
      return
    }

    if (productType === 'WHOLESALE') {
      throw new AppError('Wholesale products are not supported by the current schema', 400)
    }

    if (productType === 'SHOP') {
      const product = await productRepository.findById(parsed.shopProductId!) 
      if (!product) {
        throw new AppError('Shop product not found', 404)
      }
      return
    }

    throw new AppError('Invalid productType', 400)
  }
}

export const wishlistService = new WishlistService()
