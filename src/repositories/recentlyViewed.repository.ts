import prismaClient from '../utils/prismaClient.js'

export class RecentlyViewedRepository {
  async findByUser(userId: number) {
    return prismaClient.recentlyViewedProduct.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 20, // Keep latest 20 items
    })
  }

  async addOrUpdate(userId: number, productType: string, productId: string) {
    try {
      return await prismaClient.recentlyViewedProduct.upsert({
        where: {
          userId_productType_productId: { userId, productType, productId },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          userId,
          productType,
          productId,
        },
      })
    } catch {
      await prismaClient.recentlyViewedProduct.updateMany({
        where: { userId, productType, productId },
        data: { viewedAt: new Date() },
      })
      return prismaClient.recentlyViewedProduct.findFirst({
        where: { userId, productType, productId },
      })
    }
  }
}

export const recentlyViewedRepository = new RecentlyViewedRepository()
