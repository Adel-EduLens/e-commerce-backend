import { userNotificationRepository } from '../repositories/userNotification.repository.js'

export const userNotificationService = {
  async getNotifications(userId: number) {
    return userNotificationRepository.findByUser(userId)
  },

  async getUnreadCount(userId: number) {
    return userNotificationRepository.countUnread(userId)
  },

  async markRead(id: number, userId: number) {
    return userNotificationRepository.markAsRead(id, userId)
  },

  async markAllRead(userId: number) {
    return userNotificationRepository.markAllAsRead(userId)
  },

  async deleteNotification(id: number, userId: number) {
    return userNotificationRepository.deleteNotification(id, userId)
  }
}
