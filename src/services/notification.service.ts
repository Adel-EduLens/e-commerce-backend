import AppError from '../utils/AppError.util.js'
import { notificationRepository } from '../repositories/notification.repository.js'

export const notificationService = {
  async getNotifications(userId: number, query: Record<string, any>) {
    const page = Number(query.page || 1)
    const limit = Number(query.limit || 10)
    const isReadParam = query.isRead
    let isRead: boolean | undefined

    if (isReadParam !== undefined) {
      if (isReadParam === 'true') {
        isRead = true
      } else if (isReadParam === 'false') {
        isRead = false
      } else {
        throw new AppError('isRead must be true or false', 400)
      }
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new AppError('Page must be a positive integer', 400)
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400)
    }

    const { notifications, total } = await notificationRepository.findManyByUserId(userId, {
      page,
      limit,
      ...(isRead !== undefined ? { isRead } : {}),
    })

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 0,
      },
    }
  },

  async getUnreadCount(userId: number) {
    const count = await notificationRepository.countUnreadByUserId(userId)

    return { count }
  },

  async markAsRead(userId: number, notificationId: number) {
    const notification = await notificationRepository.findByIdAndUserId(notificationId, userId)

    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    return notificationRepository.markAsRead(notificationId)
  },

  async markAllAsRead(userId: number) {
    return notificationRepository.markAllAsRead(userId)
  },

  async deleteNotification(userId: number, notificationId: number) {
    const notification = await notificationRepository.findByIdAndUserId(notificationId, userId)

    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    return notificationRepository.deleteById(notificationId)
  },
}
