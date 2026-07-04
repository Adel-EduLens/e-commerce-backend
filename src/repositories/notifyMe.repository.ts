import prisma from '../utils/prismaClient.js'

class NotifyMeRepository {
  async findManyByUserId(userId: number) {
    return prisma.notifyMe.findMany({
      where: { userId, isActive: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findActiveByUserAndProduct(userId: number, productId: string) {
    return prisma.notifyMe.findFirst({
      where: {
        userId,
        productId,
        isActive: true,
      },
    })
  }

  async findByIdAndUserId(id: number, userId: number) {
    return prisma.notifyMe.findFirst({
      where: { id, userId },
    })
  }

  async create(data: any) {
    return prisma.notifyMe.create({
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    })
  }

  async deactivate(id: number) {
    return prisma.notifyMe.update({
      where: { id },
      data: { isActive: false },
    })
  }
}

export const notifyMeRepository = new NotifyMeRepository()
