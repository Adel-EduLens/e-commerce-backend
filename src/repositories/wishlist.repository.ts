import prisma from '../utils/prismaClient.js'
import type { WishlistProductType } from '@prisma/client'

class WishlistRepository {
  async findManyByUserId(userId: number) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        retailProduct: {
          include: {
            category: true,
            images: true,
          },
        },
        shopProduct: {
          include: {
            category: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByUserTypeAndProductId(
    userId: number,
    productType: WishlistProductType,
    retailProductId?: number | null,
    wholesaleProductId?: number | null,
    shopProductId?: string | null
  ) {
    return prisma.wishlistItem.findFirst({
      where: {
        userId,
        productType,
        retailProductId: retailProductId ?? null,
        wholesaleProductId: wholesaleProductId ?? null,
        shopProductId: shopProductId ?? null,
      },
    })
  }

  async create(data: any) {
    return prisma.wishlistItem.create({
      data,
      include: {
        retailProduct: {
          include: {
            category: true,
            images: true,
          },
        },
        shopProduct: {
          include: {
            category: true,
            images: true,
          },
        },
      },
    })
  }

  async deleteById(id: number) {
    return prisma.wishlistItem.delete({
      where: { id },
    })
  }

  async deleteByUserTypeAndProductId(
    userId: number,
    productType: WishlistProductType,
    retailProductId?: number | null,
    wholesaleProductId?: number | null,
    shopProductId?: string | null
  ) {
    return prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productType,
        retailProductId: retailProductId ?? null,
        wholesaleProductId: wholesaleProductId ?? null,
        shopProductId: shopProductId ?? null,
      },
    })
  }
}

export const wishlistRepository = new WishlistRepository()
