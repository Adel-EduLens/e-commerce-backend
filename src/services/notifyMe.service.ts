import prisma from '../utils/prismaClient.js'
import { notifyMeRepository } from '../repositories/notifyMe.repository.js'
import { Product } from '@prisma/client'

type PopulatedProduct = Product | {
  name: string
  price: number
  stock: number
  images: { url: string }[]
} | null

export const notifyMeService = {
  async getSubscriptions(userId: number) {
    const subs = await notifyMeRepository.findActiveByUser(userId)

    const productIds = subs
      .filter((s) => s.targetType !== 'CATEGORY')
      .map((s) => s.targetId)

    const categoryIds = subs
      .filter((s) => s.targetType === 'CATEGORY')
      .map((s) => s.targetId)

    const [products, categories] = await Promise.all([
      productIds.length > 0
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { images: true },
          })
        : [],
      categoryIds.length > 0
        ? prisma.category.findMany({
            where: { id: { in: categoryIds } },
          })
        : [],
    ])

    const productMap = new Map(products.map((p) => [p.id, p]))
    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    const populatedSubs = subs.map((sub) => {
      let product: PopulatedProduct = null

      if (sub.targetType !== 'CATEGORY') {
        product = productMap.get(sub.targetId) || null
      } else if (sub.targetType === 'CATEGORY') {
        const category = categoryMap.get(sub.targetId)
        product = category
          ? {
              name: category.name,
              price: 0,
              stock: 1,
              images: category.image ? [{ url: category.image }] : [],
            }
          : null
      }

      return {
        id: sub.id,
        userId: sub.userId,
        targetType: sub.targetType,
        targetId: sub.targetId,
        isActive: sub.isActive,
        createdAt: sub.createdAt,
        product,
      }
    })

    return populatedSubs.filter((sub) => sub.product !== null)
  },

  async checkSubscription(userId: number, targetType: string, targetId: string) {
    const sub = await notifyMeRepository.findByUniqueIndex(userId, targetType, targetId)
    return sub ? sub.isActive : false
  },

  async subscribe(userId: number, targetType: string, targetId: string) {
    return notifyMeRepository.upsertSubscription(userId, targetType, targetId)
  },

  async unsubscribe(userId: number, targetType: string, targetId: string) {
    return notifyMeRepository.updateSubscriptionStatus(userId, targetType, targetId, false)
  },
}
