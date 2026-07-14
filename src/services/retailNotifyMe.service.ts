import { RetailNotifyMeRepository } from '../repositories/retailNotifyMe.repository.js'
import { retailProductRepository } from '../repositories/retailProduct.repository.js'
import { userRepository } from '../repositories/user.repository.js'
import AppError from '../utils/AppError.util.js'

const retailNotifyMeRepository = new RetailNotifyMeRepository()


export class RetailNotifyMeService {
  async getUserNotifications(userId: number) {
    return retailNotifyMeRepository.findByUser(userId)
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

    return retailNotifyMeRepository.create(userId, retailProductId)
  }

  async deleteNotification(userId: number, retailProductId: number) {
    const existing = await retailNotifyMeRepository.existsByUserAndProduct(userId, retailProductId)
    if (!existing) {
      throw new AppError('Subscription not found', 404)
    }

    return retailNotifyMeRepository.deactivateByUserAndProduct(userId, retailProductId)
  }

  async deleteNotificationByUserAndProduct(userId: number, retailProductId: number) {
    const existing = await retailNotifyMeRepository.existsByUserAndProduct(userId, retailProductId)
    if (!existing) {
      throw new AppError('Subscription not found', 404)
    }

    return retailNotifyMeRepository.deactivateByUserAndProduct(userId, retailProductId)
  }
}
