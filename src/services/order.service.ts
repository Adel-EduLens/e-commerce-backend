import AppError from '../utils/AppError.util.js'
import { orderRepository } from '../repositories/order.repository.js'

const allowedStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']

export const orderService = {
  async getOrders(userId: number, query: Record<string, any>) {
    const page = Number(query.page || 1)
    const limit = Number(query.limit || 10)
    const status = typeof query.status === 'string' ? query.status.toUpperCase() : undefined
    const search = typeof query.search === 'string' ? query.search.trim() : undefined

    if (!Number.isInteger(page) || page < 1) {
      throw new AppError('Page must be a positive integer', 400)
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400)
    }

    if (status && !allowedStatuses.includes(status)) {
      throw new AppError('Invalid order status', 400)
    }

    const { orders, total } = await orderRepository.findManyByUserId(userId, {
      page,
      limit,
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    })

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 0,
      },
    }
  },

  async getOrderById(userId: number, orderId: number) {
    const order = await orderRepository.findByIdAndUserId(orderId, userId)

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    return order
  },

  async cancelOrder(userId: number, orderId: number) {
    const order = await orderRepository.findByIdAndUserId(orderId, userId)

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('Only pending or confirmed orders can be cancelled', 400)
    }

    return orderRepository.updateStatus(orderId, 'CANCELLED')
  },
}
