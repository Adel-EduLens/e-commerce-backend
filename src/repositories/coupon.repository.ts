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
  isActive: boolean;
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
        ...(data.isActive !== undefined && { isActive: data.isActive }),
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

  async getAnalytics(traderId: number) {
    const coupons = await prisma.coupon.findMany({
      where: { traderId },
      include: {
        category: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
        usages: true,
      },
      orderBy: {
        usedCount: "desc",
      },
    });

    const now = new Date();

    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.isActive && new Date(c.validUntil) > now).length;
    const expiredCoupons = coupons.filter(c => new Date(c.validUntil) <= now).length;
    const inactiveCoupons = coupons.filter(c => !c.isActive).length;
    const totalUsages = coupons.reduce((acc, c) => acc + c.usedCount, 0);

    const avgDiscount = totalCoupons > 0
      ? Math.round((coupons.reduce((acc, c) => acc + c.discount, 0) / totalCoupons) * 10) / 10
      : 0;

    // Discount range breakdown
    const discountRanges = {
      range1_15: coupons.filter(c => c.discount <= 15).length,
      range16_30: coupons.filter(c => c.discount > 15 && c.discount <= 30).length,
      range31_50: coupons.filter(c => c.discount > 30 && c.discount <= 50).length,
      range51Plus: coupons.filter(c => c.discount > 50).length,
    };

    // Scope breakdown
    const scopeBreakdown = {
      global: coupons.filter(c => !c.categoryId && !c.productId).length,
      category: coupons.filter(c => Boolean(c.categoryId)).length,
      product: coupons.filter(c => Boolean(c.productId)).length,
    };

    // Last 6 months usage trend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrend: { monthKey: string; defaultMonth: string; usages: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const mName = monthNames[monthIdx] || "Jan";
      const monthKey = mName.toLowerCase();
      const defaultMonth = mName;

      // Count usages in this month
      let count = 0;
      coupons.forEach(c => {
        c.usages.forEach(u => {
          const uDate = new Date(u.usedAt);
          if (uDate.getMonth() === monthIdx && uDate.getFullYear() === year) {
            count++;
          }
        });
      });

      monthlyTrend.push({
        monthKey,
        defaultMonth,
        usages: count,
      });
    }

    // Top 5 coupons by usages
    const topCoupons = coupons.slice(0, 5).map(c => {
      const restrictionName = c.product?.name ?? c.category?.name ?? null;
      return {
        id: c.id,
        code: c.code,
        discount: c.discount,
        usedCount: c.usedCount,
        usageLimit: c.usageLimit,
        validUntil: c.validUntil,
        isActive: c.isActive,
        restriction: restrictionName,
        scope: c.product ? ("product" as const) : c.category ? ("category" as const) : ("global" as const),
      };
    });

    return {
      summary: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        inactiveCoupons,
        totalUsages,
        avgDiscount,
      },
      discountRanges,
      scopeBreakdown,
      monthlyTrend,
      topCoupons,
    };
  }
}

export const couponRepository = new CouponRepository();
