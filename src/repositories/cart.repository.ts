import prisma from '../utils/prismaClient.js';

export const cartRepository = {
  findCartByUserId: async (userId: number) => {
    return prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
  },

  createCartForUser: async (userId: number) => {
    return prisma.cart.create({
      data: { userId },
      include: { items: true },
    });
  },

  findCartItem: async (cartId: string, productId: string, productType: string, size?: string, color?: string) => {
    return prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        productType,
        size: size || null,
        color: color || null,
      },
    });
  },

  addCartItem: async (data: any) => {
    return prisma.cartItem.create({ data });
  },

  updateCartItemQuantity: async (itemId: string, quantity: number) => {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  },

  removeCartItem: async (itemId: string) => {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  },

  clearCart: async (cartId: string) => {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  },
};
