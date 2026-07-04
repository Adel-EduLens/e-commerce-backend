import prisma from '../utils/prismaClient.js'

class NotificationRepository {
  async findManyByUserId(
    userId: number,
    options: { page: number; limit: number; isRead?: boolean }
  ) {
    const where: Record<string, any> = { userId }

    if (options.isRead !== undefined) {
      where.isRead = options.isRead
    }

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.notification.count({ where }),
    ])

    return { notifications, total }
  }

  async countUnreadByUserId(userId: number) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    })
  }

  async findByIdAndUserId(notificationId: number, userId: number) {
    return prisma.notification.findFirst({
      where: { id: notificationId, userId },
    })
  }

  async markAsRead(notificationId: number) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })
  }

  async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  }

  async deleteById(notificationId: number) {
    return prisma.notification.delete({ where: { id: notificationId } })
  }
}

export const notificationRepository = new NotificationRepository()
