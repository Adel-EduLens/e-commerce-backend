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
    // Upsert isn't directly possible based on a complex unique if it's not handled easily, but we have @@unique([userId, productType, productId])
    return prismaClient.recentlyViewedProduct.upsert({
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
  }
}

export const recentlyViewedRepository = new RecentlyViewedRepository()
