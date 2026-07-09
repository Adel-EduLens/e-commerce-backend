import prisma from "../utils/prismaClient.js";
import type { Prisma } from "@prisma/client";

class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({
      data,
    });
  }

  async findAll() {
    return prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
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
    const [products, wholesales, coupons] = await Promise.all([
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
    ]);

    return {
      products,
      wholesales,
      coupons,
    };
  }

  async findByName(name: string) {
    return prisma.category.findUnique({
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
