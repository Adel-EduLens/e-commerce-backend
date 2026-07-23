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

    // Fetch Shop & Retail orders (unless type is WHOLESALE)
    let shopOrders: any[] = [];
    if (!query.type || query.type === "ALL" || query.type !== "WHOLESALE") {
      shopOrders = await prisma.order.findMany({
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

    // Fetch Wholesale orders ONLY if type is ALL or WHOLESALE
    let wholesaleOrders: any[] = [];
    if (query.type === "ALL" || query.type === "WHOLESALE") {
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

    return [
      ...shopOrders.map((o) => ({ ...o, orderType: "SHOP" })),
      ...wholesaleOrders.map((o) => ({ ...o, orderType: "WHOLESALE" })),
    ].sort(
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

  async findTraderCustomers(traderId: number) {
    // Get all product IDs belonging to this trader
    const products = await prisma.product.findMany({
      where: { traderId },
      select: { id: true },
    });
    const traderProductIds = products.map((p) => p.id);

    if (traderProductIds.length === 0) return [];

    const orderWhere = {
      items: { some: { productId: { in: traderProductIds } } },
    };

    // Fetch shop orders
    const shopOrders = await prisma.order.findMany({
      where: orderWhere,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // Fetch wholesale orders
    const wholesaleOrders = await prisma.wholesaleOrder.findMany({
      where: orderWhere,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate per unique customer (keyed by email)
    const customerMap = new Map<string, any>();

    const processOrder = (order: any) => {
      const email = order.email;
      const traderItems = order.items.filter((i: any) =>
        traderProductIds.includes(i.productId)
      );
      const traderTotal = traderItems.reduce(
        (sum: number, i: any) => sum + i.price * i.quantity,
        0
      );

      if (customerMap.has(email)) {
        const existing = customerMap.get(email)!;
        existing.orders += 1;
        existing.totalSpent += traderTotal;
        if (new Date(order.createdAt) > new Date(existing.lastPurchase)) {
          existing.lastPurchase = order.createdAt;
          existing.lastStatus = order.status;
        }
      } else {
        customerMap.set(email, {
          email,
          name: `${order.firstName || ""} ${order.lastName || ""}`.trim() || email,
          phone: order.phone || null,
          orders: 1,
          totalSpent: traderTotal,
          lastPurchase: order.createdAt,
          lastStatus: order.status,
        });
      }
    };

    shopOrders.forEach(processOrder);
    wholesaleOrders.forEach(processOrder);

    return Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastPurchase).getTime() - new Date(a.lastPurchase).getTime()
    );
  }
}

export const orderRepository = new OrderRepository();
