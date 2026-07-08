import prisma from '../utils/prismaClient.js'

class NotificationRepository {
  getSubscribersForCategory(categoryId: string) {
    return prisma.notifyMeSubscription.findMany({
      where: { targetType: 'CATEGORY', targetId: categoryId, isActive: true },
      select: { userId: true },
    })
  }

  createMany(notifications: { userId: number; title: string; body: string; imageUrl?: string; productId?: string; categoryId?: string }[]) {
    return prisma.userNotification.createMany({
      data: notifications.map(({ body, categoryId: _c, ...rest }) => ({
        ...rest,
        message: body,
        type: 'new_product',
      })),
    })
  }

  getUserNotifications(userId: number) {
    return prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  markRead(id: number, userId: number) {
    return prisma.userNotification.updateMany({ where: { id, userId }, data: { isRead: true } })
  }

  markAllRead(userId: number) {
    return prisma.userNotification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
  }

  countUnread(userId: number) {
    return prisma.userNotification.count({ where: { userId, isRead: false } })
  }
}

export const notificationRepository = new NotificationRepository()
