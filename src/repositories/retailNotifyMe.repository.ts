import prismaClient from '../utils/prismaClient.js'

export class RetailNotifyMeRepository {
  async findByUser(userId: number) {
    return prismaClient.notifyMeSubscription.findMany({
      where: { userId, targetType: 'RETAIL_RESTOCK', isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(userId: number, retailProductId: number) {
    return prismaClient.notifyMeSubscription.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: 'RETAIL_RESTOCK',
          targetId: String(retailProductId),
        },
      },
      update: { isActive: true },
      create: {
        userId,
        targetType: 'RETAIL_RESTOCK',
        targetId: String(retailProductId),
      },
    })
  }

  async existsByUserAndProduct(userId: number, retailProductId: number) {
    return prismaClient.notifyMeSubscription.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: 'RETAIL_RESTOCK',
          targetId: String(retailProductId),
        },
      },
    })
  }

  async deactivateByUserAndProduct(userId: number, retailProductId: number) {
    return prismaClient.notifyMeSubscription.updateMany({
      where: {
        userId,
        targetType: 'RETAIL_RESTOCK',
        targetId: String(retailProductId),
      },
      data: { isActive: false },
    })
  }
}
