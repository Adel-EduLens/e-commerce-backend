import prisma from "../utils/prismaClient.js";
import { ProductType } from "@prisma/client";

export interface GetTraderOrdersQuery {
  type?: string | undefined;
  categoryId?: string | undefined;
  fromDate?: string | undefined;
  toDate?: string | undefined;
}

export class OrderRepository {
  async findTraderProducts(traderId: number, type?: string | undefined, categoryId?: string | undefined) {
    const productWhere: any = { traderId };

    if (type && type !== "ALL") {
      productWhere.productTypes = {
        some: { type: type as ProductType },
      };
    }

    if (categoryId && categoryId !== "ALL") {
      productWhere.categories = {
        some: {
          OR: [{ id: categoryId }, { name: categoryId }],
        },
      };
    }

    return prisma.product.findMany({
      where: productWhere,
      select: { id: true },
    });
  }

  async findTraderOrders(traderProductIds: string[], query: GetTraderOrdersQuery) {
    if (traderProductIds.length === 0) return [];

    const dateWhere: any = {};
    if (query.fromDate) {
      const start = new Date(query.fromDate);
      start.setHours(0, 0, 0, 0);
      dateWhere.gte = start;
    }
    if (query.toDate) {
      const end = new Date(query.toDate);
      end.setHours(23, 59, 59, 999);
      dateWhere.lte = end;
    }

    const orderWhere: any = {
      items: {
        some: {
          productId: { in: traderProductIds },
        },
      },
    };

    if (Object.keys(dateWhere).length > 0) {
      orderWhere.createdAt = dateWhere;
    }

    // Fetch Shop & Retail orders
    const shopOrders = await prisma.order.findMany({
      where: orderWhere,
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
        createdAt: "desc",
      },
    });

    // Fetch Wholesale orders if type is ALL or WHOLESALE
    let wholesaleOrders: any[] = [];
    if (!query.type || query.type === "ALL" || query.type === "WHOLESALE") {
      wholesaleOrders = await prisma.wholesaleOrder.findMany({
        where: orderWhere,
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
          createdAt: "desc",
        },
      });
    }

    return [...shopOrders, ...wholesaleOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findUserOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async updateOrderStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}

export const orderRepository = new OrderRepository();
