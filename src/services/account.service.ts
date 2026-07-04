import AppError from '../utils/AppError.util.js'
import { accountRepository } from '../repositories/account.repository.js'
import { notificationRepository } from '../repositories/notification.repository.js'
import { orderRepository } from '../repositories/order.repository.js'
import { walletRepository } from '../repositories/wallet.repository.js'

export const accountService = {
  async getDashboard(userId: number) {
    const user = await accountRepository.findProfileById(userId)

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders, recentOrders, wallet, unreadCount] = await Promise.all([
      orderRepository.countByUserId(userId),
      orderRepository.countByUserId(userId, 'PENDING'),
      orderRepository.countByUserId(userId, 'DELIVERED'),
      orderRepository.countByUserId(userId, 'CANCELLED'),
      orderRepository.findRecentByUserId(userId, 5),
      walletRepository.getOrCreateWallet(userId),
      notificationRepository.countUnreadByUserId(userId),
    ])

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        recent: recentOrders,
      },
      wallet: {
        balance: wallet.balance,
        rewardPoints: wallet.rewardPoints,
      },
      notifications: {
        unreadCount,
      },
    }
  },

  async getProfile(userId: number) {
    const user = await accountRepository.findProfileById(userId)

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  },

  async updateProfile(userId: number, data: Record<string, any>) {
    const allowedFields = ['name', 'phone', 'avatar', 'dateOfBirth', 'gender']
    const payload: Record<string, any> = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'name') {
          if (typeof data.name !== 'string' || data.name.trim().length < 2) {
            throw new AppError('Name must be at least 2 characters long', 400)
          }
          payload.name = data.name.trim()
        } else if (field === 'phone') {
          if (data.phone !== null && data.phone !== '' && !/^\+?[0-9]{7,15}$/.test(String(data.phone))) {
            throw new AppError('Phone must contain only numbers and optional + sign', 400)
          }
          payload.phone = data.phone || null
        } else if (field === 'avatar') {
          if (data.avatar !== null && data.avatar !== '' && typeof data.avatar !== 'string') {
            throw new AppError('Avatar must be a valid string URL', 400)
          }
          payload.avatar = data.avatar || null
        } else if (field === 'dateOfBirth') {
          if (data.dateOfBirth) {
            payload.dateOfBirth = new Date(data.dateOfBirth)
          }
        } else if (field === 'gender') {
          const validGenders = ['male', 'female', 'other', 'prefer_not_to_say']
          if (data.gender !== null && data.gender !== '' && !validGenders.includes(data.gender)) {
            throw new AppError('Gender is invalid', 400)
          }
          payload.gender = data.gender || null
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      throw new AppError('No valid fields provided', 400)
    }

    return accountRepository.updateProfile(userId, payload)
  },

  async signOut() {
    return { message: 'Signed out successfully' }
  },
}
