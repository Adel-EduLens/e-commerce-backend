import prisma from "../utils/prismaClient.js";

export type CouponCreateInput = {
  code: string;
  discount: number;
  validUntil: Date;
  traderId: number;
  categoryId?: string | null;
  productId?: string | null;
  usageLimit?: number | null;
};

export type CouponUpdateInput = Partial<{
  code: string;
  discount: number;
  validUntil: Date;
  categoryId: string | null;
  productId: string | null;
  usageLimit: number | null;
  usedCount: number;
}>;

class CouponRepository {
  create(data: CouponCreateInput) {
    return prisma.coupon.create({
      data: {
        code: data.code,
        discount: data.discount,
        validUntil: data.validUntil,
        usageLimit: data.usageLimit !== undefined ? data.usageLimit : null,
        trader: {
          connect: { id: data.traderId }
        },
        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } }
        }),
        ...(data.productId && {
          product: { connect: { id: data.productId } }
        })
      },
      include: {
        category: true,
        product: true,
        trader: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  findAll(filter?: { traderId?: number }) {
    return prisma.coupon.findMany({
      ...(filter ? { where: filter } : {}),
      include: {
        category: true,
        product: true,
        usages: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  findById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
      include: {
        category: true,
        product: true,
        trader: {
          select: { id: true, name: true, email: true }
        },
        usages: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        }
      }
    });
  }

  findByCode(code: string) {
    return prisma.coupon.findUnique({
      where: { code },
      include: {
        category: true,
        product: true
      }
    });
  }

  update(id: string, data: CouponUpdateInput) {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.productId !== undefined && { productId: data.productId }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.usedCount !== undefined && { usedCount: data.usedCount }),
      },
      include: {
        category: true,
        product: true
      }
    });
  }

  incrementUsedCount(code: string, userId: number) {
    return prisma.coupon.update({
      where: { code },
      data: {
        usedCount: {
          increment: 1
        },
        usages: {
          create: {
            user: {
              connect: { id: userId }
            }
          }
        }
      },
      include: {
        category: true,
        product: true,
        usages: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        }
      }
    });
  }

  delete(id: string) {
    return prisma.coupon.delete({
      where: { id }
    });
  }
}

export const couponRepository = new CouponRepository();
