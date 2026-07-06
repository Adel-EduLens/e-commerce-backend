import { RetailNotifyMeRepository } from '../repositories/retailNotifyMe.repository.js'
import { RetailProductRepository } from '../repositories/retailProduct.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import AppError from '../utils/AppError.util.js'

const retailNotifyMeRepository = new RetailNotifyMeRepository()
const retailProductRepository = new RetailProductRepository()

export class RetailNotifyMeService {
  async getUserNotifications(userId: number) {
    return retailNotifyMeRepository.findByUser(userId)
  }

  async getNotificationById(id: number) {
    const notification = await retailNotifyMeRepository.findById(id)
    if (!notification) {
      throw new AppError('Notification not found', 404)
    }
    return notification
  }

  async createNotification(userId: number, retailProductId: number) {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const product = await retailProductRepository.findById(retailProductId)
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    const existing = await retailNotifyMeRepository.existsByUserAndProduct(userId, retailProductId)
    if (existing) {
      if (existing.isActive) {
        return existing
      }
      return retailNotifyMeRepository.updateStatus(existing.id, true)
    }

    return retailNotifyMeRepository.create(userId, retailProductId)
  }

  async deleteNotification(id: number) {
    const notification = await retailNotifyMeRepository.findById(id)
    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    return retailNotifyMeRepository.updateStatus(id, false)
  }

  async deleteNotificationByUserAndProduct(userId: number, retailProductId: number) {
    const existing = await retailNotifyMeRepository.existsByUserAndProduct(userId, retailProductId)
    if (!existing) {
      throw new AppError('Subscription not found', 404)
    }

    return retailNotifyMeRepository.deactivateByUserAndProduct(userId, retailProductId)
  }
}
