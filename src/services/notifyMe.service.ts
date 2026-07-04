import AppError from '../utils/AppError.util.js'
import { notifyMeRepository } from '../repositories/notifyMe.repository.js'
import { productRepository } from '../repositories/product.repository.js'

export const notifyMeService = {
  async getNotifyMeItems(userId: number) {
    return notifyMeRepository.findManyByUserId(userId)
  },

  async createNotifyMe(userId: number, productId: string) {
    const product = await productRepository.findById(productId)

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    const existing = await notifyMeRepository.findActiveByUserAndProduct(userId, productId)

    if (existing) {
      throw new AppError('This product is already in your notify list', 400)
    }

    return notifyMeRepository.create({
      userId,
      productId,
      isActive: true,
    })
  },

  async deleteNotifyMe(userId: number, id: number) {
    const item = await notifyMeRepository.findByIdAndUserId(id, userId)

    if (!item) {
      throw new AppError('Notify me item not found', 404)
    }

    return notifyMeRepository.deactivate(id)
  },
}
