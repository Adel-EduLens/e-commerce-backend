import prisma from '../utils/prismaClient.js'
import { notifyMeRepository } from '../repositories/notifyMe.repository.js'
import { Product, RetailProduct, Wholesale } from '@prisma/client'

type PopulatedProduct = Product | RetailProduct | Wholesale | {
  name: string
  price: number
  stock: number
  images: { url: string }[]
} | null


export const notifyMeService = {
  async getSubscriptions(userId: number) {
    const subs = await notifyMeRepository.findActiveByUser(userId)

    const shopIds = subs
      .filter((s) => s.targetType === 'SHOP_RESTOCK')
      .map((s) => s.targetId)

    const retailIds = subs
      .filter((s) => s.targetType === 'RETAIL_RESTOCK')
      .map((s) => Number(s.targetId))

    const wholesaleIds = subs
      .filter((s) => s.targetType === 'WHOLESALE_RESTOCK')
      .map((s) => s.targetId)

    const categoryIds = subs
      .filter((s) => s.targetType === 'CATEGORY')
      .map((s) => s.targetId)

    const [shopProducts, retailProducts, wholesaleProducts, categories] = await Promise.all([
      shopIds.length > 0
        ? prisma.product.findMany({
            where: { id: { in: shopIds } },
            include: { images: true },
          })
        : [],
      retailIds.length > 0
        ? prisma.retailProduct.findMany({
            where: { id: { in: retailIds } },
            include: { images: true },
          })
        : [],
      wholesaleIds.length > 0
        ? prisma.wholesale.findMany({
            where: { id: { in: wholesaleIds } },
            include: { images: true },
          })
        : [],
      categoryIds.length > 0
        ? prisma.category.findMany({
            where: { id: { in: categoryIds } },
          })
        : [],
    ])

    const shopMap = new Map(shopProducts.map((p) => [p.id, p]))
    const retailMap = new Map(retailProducts.map((p) => [p.id, p]))
    const wholesaleMap = new Map(wholesaleProducts.map((p) => [p.id, p]))
    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    const populatedSubs = subs.map((sub) => {
      let product: PopulatedProduct = null

      if (sub.targetType === 'SHOP_RESTOCK') {
        product = shopMap.get(sub.targetId) || null
      } else if (sub.targetType === 'RETAIL_RESTOCK') {
        product = retailMap.get(Number(sub.targetId)) || null
      } else if (sub.targetType === 'WHOLESALE_RESTOCK') {
        product = wholesaleMap.get(sub.targetId) || null
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

    return populatedSubs
  },

  async checkSubscription(userId: number, targetType: string, targetId: string) {
    const sub = await notifyMeRepository.findByUniqueIndex(userId, targetType, targetId)
    return { isSubscribed: !!(sub?.isActive) }
  },

  async subscribe(userId: number, targetType: string, targetId: string) {
    return notifyMeRepository.upsertSubscription(userId, targetType, targetId)
  },

  async unsubscribe(userId: number, targetType: string, targetId: string) {
    return notifyMeRepository.updateSubscriptionStatus(userId, targetType, targetId, false)
  }
}
