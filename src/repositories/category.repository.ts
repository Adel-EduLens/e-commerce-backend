import prisma from "../utils/prismaClient.js";
import type { Prisma } from "@prisma/client";

class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({
      data,
    });
  }

  async findAll(filters: { isWholesale?: boolean; isRetail?: boolean } = {}) {
    return prisma.category.findMany({
      where: {
        ...filters,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
            retailProducts: true,
          },
        },
      },
    });
  }

  async findById(id: string, filters: { isWholesale?: boolean; isRetail?: boolean } = {}) {
    return prisma.category.findFirst({
      where: { id, ...filters },
      include: {
        _count: {
          select: {
            products: true,
            retailProducts: true,
          },
        },
      },
    });
  }

  async hasProducts(id: string) {
    return prisma.product.count({
      where: {
        categoryId: id,
      },
    });
  }
  async getCategoryUsage(id: string) {
    const [products, wholesales, coupons, retailProducts] = await Promise.all([
      prisma.product.count({
        where: {
          categoryId: id,
        },
      }),

      prisma.wholesale.count({
        where: {
          categoryId: id,
        },
      }),

      prisma.coupon.count({
        where: {
          categoryId: id,
        },
      }),
      prisma.retailProduct.count({
        where: { categoryId: id },
      }),
    ]);

    return {
      products,
      wholesales,
      coupons,
      retailProducts,
    };
  }

  async findByName(name: string) {
    return prisma.category.findFirst({
      where: { name },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
