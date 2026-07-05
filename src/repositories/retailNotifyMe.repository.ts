import prismaClient from '../utils/prismaClient.js'

export class RetailNotifyMeRepository {
  async findByUser(userId: number) {
    return prismaClient.retailNotifyMe.findMany({
      where: { userId, isActive: true },
      include: {
        retailProduct: {
          include: {
            category: true,
            images: true,
            colors: true,
            sizes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: number) {
    return prismaClient.retailNotifyMe.findUnique({
      where: { id },
      include: {
        retailProduct: {
          include: {
            category: true,
            images: true,
            colors: true,
            sizes: true
          }
        }
      }
    })
  }

  async create(userId: number, retailProductId: number) {
    return prismaClient.retailNotifyMe.create({
      data: { userId, retailProductId },
      include: {
        retailProduct: {
          include: {
            category: true,
            images: true,
            colors: true,
            sizes: true
          }
        }
      }
    })
  }

  async delete(id: number) {
    return prismaClient.retailNotifyMe.delete({
      where: { id }
    })
  }

  async existsByUserAndProduct(userId: number, retailProductId: number) {
    return prismaClient.retailNotifyMe.findUnique({
      where: {
        userId_retailProductId: {
          userId,
          retailProductId
        }
      }
    })
  }

  async deleteByUserAndProduct(userId: number, retailProductId: number) {
    return prismaClient.retailNotifyMe.delete({
      where: {
        userId_retailProductId: {
          userId,
          retailProductId
        }
      }
    })
  }
}
