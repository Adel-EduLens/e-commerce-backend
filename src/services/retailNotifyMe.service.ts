import { RetailNotifyMeRepository } from '../repositories/retailNotifyMe.repository.js'
import { RetailProductRepository } from '../repositories/retailProduct.repository.js'
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
    // Validate product exists
    const product = await retailProductRepository.findById(retailProductId)
    if (!product) {
      throw new AppError('Product not found', 404)
    }

    // Check if already subscribed
    const existing = await retailNotifyMeRepository.existsByUserAndProduct(userId, retailProductId)
    if (existing && existing.isActive) {
      throw new AppError('Already subscribed to this product', 400)
    }

    return retailNotifyMeRepository.create(userId, retailProductId)
  }

  async deleteNotification(id: number) {
    const notification = await retailNotifyMeRepository.findById(id)
    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    return retailNotifyMeRepository.delete(id)
  }

  async deleteNotificationByUserAndProduct(userId: number, retailProductId: number) {
    const existing = await retailNotifyMeRepository.existsByUserAndProduct(userId, retailProductId)
    if (!existing) {
      throw new AppError('Subscription not found', 404)
    }

    return retailNotifyMeRepository.deleteByUserAndProduct(userId, retailProductId)
  }
}
