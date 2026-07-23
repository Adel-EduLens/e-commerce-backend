import prisma from '../utils/prismaClient.js';
import { Prisma } from '@prisma/client';

export type Transaction = Prisma.TransactionClient;

export class WholesaleOrderRepository {
  async runInTransaction<T>(cb: (tx: Transaction) => Promise<T>): Promise<T> {
    return prisma.$transaction(cb);
  }

  async findProductWithImagesAndColors(productId: string, tx: Transaction = prisma) {
    return tx.product.findUnique({
      where: { id: productId },
      include: { images: true, colors: true },
    });
  }

  async findProductById(productId: string, tx: Transaction = prisma) {
    return tx.product.findUnique({
      where: { id: productId },
      include: { images: true, colors: true },
    });
  }

  async findProductColors(productId: string, tx: Transaction = prisma) {
    return tx.productColor.findMany({
      where: { productId },
      include: { sizes: true },
    });
  }

  async findProductSizes(
    where: { productId?: string; productColorId?: string },
    tx: Transaction = prisma
  ) {
    return tx.productSize.findMany({
      where,
    });
  }

  async updateProductSizeQuantity(id: string, quantity: number, tx: Transaction = prisma) {
    return tx.productSize.update({
      where: { id },
      data: { quantity },
    });
  }

  async updateProductColorStock(id: string, stock: number, tx: Transaction = prisma) {
    return tx.productColor.update({
      where: { id },
      data: { stock },
    });
  }

  async updateProductStock(id: string, stock: number, tx: Transaction = prisma) {
    return tx.product.update({
      where: { id },
      data: { stock },
    });
  }

  async createWholesaleOrder(data: any, tx: Transaction = prisma) {
    return tx.wholesaleOrder.create({
      data,
    });
  }

  async createWholesaleOrderItems(data: any[], tx: Transaction = prisma) {
    return tx.wholesaleOrderItem.createMany({
      data,
    });
  }

  async createWholesaleOrderItem(data: any, tx: Transaction = prisma) {
    return tx.wholesaleOrderItem.create({
      data,
    });
  }

  async updateWholesaleOrderItem(id: string, data: any, tx: Transaction = prisma) {
    return tx.wholesaleOrderItem.update({
      where: { id },
      data,
    });
  }

  async deleteWholesaleOrderItems(
    ids: string[],
    wholesaleOrderId: string,
    tx: Transaction = prisma
  ) {
    return tx.wholesaleOrderItem.deleteMany({
      where: {
        id: { in: ids },
        wholesaleOrderId,
      },
    });
  }

  async findWholesaleOrderById(id: string, tx: Transaction = prisma) {
    return tx.wholesaleOrder.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findTraderProductIds(traderId: number) {
    const products = await prisma.product.findMany({
      where: { traderId },
      select: { id: true },
    });
    return products.map((p) => p.id);
  }

  async findWholesaleOrdersForTrader(traderProductIds: string[]) {
    return prisma.wholesaleOrder.findMany({
      where: {
        items: {
          some: {
            productId: { in: traderProductIds },
          },
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findWholesaleOrdersByUserId(userId: number) {
    return prisma.wholesaleOrder.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateWholesaleOrderStatus(id: string, status: string, tx: Transaction = prisma) {
    return tx.wholesaleOrder.update({
      where: { id },
      data: { status },
    });
  }

  async updateWholesaleOrderTotals(
    id: string,
    data: { subtotal: number; total: number },
    tx: Transaction = prisma
  ) {
    return tx.wholesaleOrder.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });
  }

  async deleteWholesaleOrder(id: string) {
    return prisma.wholesaleOrder.delete({
      where: { id },
    });
  }
}

export const wholesaleOrderRepository = new WholesaleOrderRepository();
