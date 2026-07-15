import prisma from '../utils/prismaClient.js'

export const notifyMeRepository = {
  async findActiveByUser(userId: number) {
    return prisma.notifyMeSubscription.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findByUniqueIndex(userId: number, targetType: string, targetId: string) {
    return prisma.notifyMeSubscription.findUnique({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId }
      }
    })
  },

  async upsertSubscription(userId: number, targetType: string, targetId: string) {
    return prisma.notifyMeSubscription.upsert({
      where: {
        userId_targetType_targetId: { userId, targetType, targetId }
      },
      update: { isActive: true },
      create: { userId, targetType, targetId },
    })
  },

  async updateSubscriptionStatus(userId: number, targetType: string, targetId: string, isActive: boolean) {
    return prisma.notifyMeSubscription.updateMany({
      where: { userId, targetType, targetId },
      data: { isActive },
    })
  }
}
