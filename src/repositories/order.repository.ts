import prisma from '../utils/prismaClient.js'

class OrderRepository {
  async findManyByUserId(
    userId: number,
    options: { page: number; limit: number; status?: string; search?: string }
  ) {
    const where: Record<string, any> = {
      userId,
    }

    if (options.status) {
      where.status = options.status as any
    }

    if (options.search) {
      where.OR = [
        { orderNumber: { contains: options.search } },
        { shippingAddress: { contains: options.search } },
      ]
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where: where as any,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: where as any }),
    ])

    return { orders, total }
  }

  async findByIdAndUserId(orderId: number, userId: number) {
    return prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
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
        },
      },
    })
  }

  async countByUserId(userId: number, status?: string) {
    return prisma.order.count({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
      } as any,
    })
  }

  async findRecentByUserId(userId: number, limit = 5) {
    return prisma.order.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
      },
    })
  }

  async updateStatus(orderId: number, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    })
  }
}

export const orderRepository = new OrderRepository()
