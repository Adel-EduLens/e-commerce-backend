import prisma from '../utils/prismaClient.js'

class RecommendRepository {
  async addSignal(userId: number, productId: string, categoryId: string, type: string) {
    return prisma.recommend.upsert({
      where: {
        userId_productId_type: {
          userId,
          productId,
          type,
        },
      },
      update: {
        timestamp: new Date(),
      },
      create: {
        userId,
        productId,
        categoryId,
        type,
      },
    })
  }

  async getSignals(userId: number) {
    return prisma.recommend.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    })
  }

  async clearSignals(userId: number) {
    return prisma.recommend.deleteMany({
      where: { userId },
    })
  }
}

export const recommendRepository = new RecommendRepository()
