import prisma from "../utils/prismaClient.js";
import { type Prisma } from "@prisma/client";

class CategoryRepository {
  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  }

  async findAll(filters: { isWholesale?: boolean; isRetail?: boolean; isShop?: boolean } = {}) {
    return prisma.category.findMany({
      where: {
        ...(filters.isWholesale !== undefined && { isWholesale: filters.isWholesale }),
        ...(filters.isRetail !== undefined && { isRetail: filters.isRetail }),
        ...(filters.isShop !== undefined && { isShop: filters.isShop }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findFirst({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async hasProducts(id: string) {
    return prisma.product.count({ where: { categories: { some: { id } } } });
  }

  async getCategoryUsage(id: string) {
    const [products, coupons] = await Promise.all([
      prisma.product.count({ where: { categories: { some: { id } } } }),
      prisma.coupon.count({ where: { categoryId: id } }),
    ]);
    return { products, coupons };
  }

  async findByName(name: string) {
    return prisma.category.findFirst({ where: { name } });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}

export const categoryRepository = new CategoryRepository();
