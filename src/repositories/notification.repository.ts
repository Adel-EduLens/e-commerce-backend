import prisma from '../utils/prismaClient.js'

class NotificationRepository {
  getSubscriptions(userId: number) {
    return prisma.categorySubscription.findMany({
      where: { userId },
      select: { categoryId: true },
    })
  }

  isSubscribed(userId: number, categoryId: string) {
    return prisma.categorySubscription.findUnique({
      where: { userId_categoryId: { userId, categoryId } },
    })
  }

  subscribe(userId: number, categoryId: string) {
    return prisma.categorySubscription.create({ data: { userId, categoryId } })
  }

  unsubscribe(userId: number, categoryId: string) {
    return prisma.categorySubscription.deleteMany({ where: { userId, categoryId } })
  }

  getSubscribersForCategory(categoryId: string) {
    return prisma.categorySubscription.findMany({
      where: { categoryId },
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
