import prismaClient from '../utils/prismaClient.js'

export class WishlistRepository {
  async findByUser(userId: number) {
    return prismaClient.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(userId: number, productType: string, productId: string) {
    return prismaClient.wishlist.findUnique({
      where: {
        userId_productType_productId: { userId, productType, productId },
      },
    })
  }

  async create(userId: number, productType: string, productId: string) {
    return prismaClient.wishlist.create({
      data: { userId, productType, productId },
    })
  }

  async delete(userId: number, productType: string, productId: string) {
    return prismaClient.wishlist.delete({
      where: {
        userId_productType_productId: { userId, productType, productId },
      },
    })
  }
  async findByProductId(userId: number, productId: string) {
    return prismaClient.wishlist.findFirst({
      where: { userId, productId },
    })
  }

  async deleteByProductId(userId: number, productId: string) {
    return prismaClient.wishlist.deleteMany({
      where: { userId, productId },
    })
  }
}

export const wishlistRepository = new WishlistRepository()
