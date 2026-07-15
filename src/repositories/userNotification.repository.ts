import prisma from '../utils/prismaClient.js'

export const userNotificationRepository = {
  async findByUser(userId: number) {
    return prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async countUnread(userId: number) {
    return prisma.userNotification.count({
      where: { userId, isRead: false },
    })
  },

  async markAsRead(id: number, userId: number) {
    return prisma.userNotification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    })
  },

  async markAllAsRead(userId: number) {
    return prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  },

  async deleteNotification(id: number, userId: number) {
    return prisma.userNotification.deleteMany({
      where: { id, userId },
    })
  }
}
