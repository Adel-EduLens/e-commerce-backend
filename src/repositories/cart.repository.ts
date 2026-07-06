import prismaClient from '../utils/prismaClient.js'

export class CartRepository {
  async findByUserId(userId: number) {
    return prismaClient.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            retailProduct: {
              include: {
                category: true,
                images: true,
                colors: true,
                sizes: true
              }
            },
            retailColor: true,
            retailSize: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })
  }

  async createForUser(userId: number) {
    return prismaClient.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true,
            retailProduct: {
              include: {
                category: true,
                images: true,
                colors: true,
                sizes: true
              }
            },
            retailColor: true,
            retailSize: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })
  }

  async findItemByCart(cartId: number, filters: Record<string, any>) {
    return prismaClient.cartItem.findFirst({
      where: {
        cartId,
        ...filters
      },
      include: {
        product: true,
        retailProduct: {
          include: {
            category: true,
            images: true,
            colors: true,
            sizes: true
          }
        },
        retailColor: true,
        retailSize: true
      }
    })
  }

  async createItem(data: any) {
    return prismaClient.cartItem.create({
      data,
      include: {
        product: true,
        retailProduct: {
          include: {
            category: true,
            images: true,
            colors: true,
            sizes: true
          }
        },
        retailColor: true,
        retailSize: true
      }
    })
  }

  async updateItemQuantity(id: number, quantity: number) {
    return prismaClient.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: true,
        retailProduct: {
          include: {
            category: true,
            images: true,
            colors: true,
            sizes: true
          }
        },
        retailColor: true,
        retailSize: true
      }
    })
  }

  async removeItem(id: number) {
    return prismaClient.cartItem.delete({
      where: { id }
    })
  }

  async clearCart(cartId: number) {
    return prismaClient.cartItem.deleteMany({
      where: { cartId }
    })
  }
}
