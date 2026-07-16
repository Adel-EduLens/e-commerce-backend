import prisma from "../utils/prismaClient.js";

class InfluencerRepository {
  // ── Influencer CRUD ──

  async create(data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
  }) {
    return prisma.influencer.create({ data });
  }

  async findById(id: number, select?: any) {
    return prisma.influencer.findUnique({
      where: { id },
      ...(select && { select }),
    });
  }

  async findByEmail(email: string) {
    return prisma.influencer.findFirst({ where: { email } });
  }

  async findAll() {
    return prisma.influencer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        coupon: {
          include: {
            _count: { select: { usages: true } },
          },
        },
      },
    });
  }

  async update(id: number, data: Partial<{
    name: string;
    email: string;
    phone: string;
    status: string;
  }>) {
    return prisma.influencer.update({ where: { id }, data });
  }

  // ── Influencer Coupon ──

  async createCoupon(data: {
    code: string;
    discountPercent: number;
    commissionPercent: number;
    influencerId: number;
  }) {
    return prisma.influencerCoupon.create({ data });
  }

  async findCouponByCode(code: string) {
    return prisma.influencerCoupon.findUnique({
      where: { code },
      include: {
        influencer: {
          select: { id: true, name: true, email: true, status: true },
        },
      },
    });
  }

  async findCouponByInfluencerId(influencerId: number) {
    return prisma.influencerCoupon.findUnique({
      where: { influencerId },
      include: {
        _count: { select: { usages: true } },
      },
    });
  }

  async updateCoupon(id: string, data: Partial<{
    code: string;
    discountPercent: number;
    commissionPercent: number;
    isActive: boolean;
  }>) {
    return prisma.influencerCoupon.update({ where: { id }, data });
  }

  // ── Coupon Usage ──

  async findCouponUsage(couponId: string, userId: number) {
    return prisma.influencerCouponUsage.findUnique({
      where: { couponId_userId: { couponId, userId } },
    });
  }

  async createCouponUsage(data: {
    couponId: string;
    userId: number;
    orderId: string;
    orderTotal: number;
    discountAmount: number;
    commissionAmount: number;
  }) {
    return prisma.influencerCouponUsage.create({ data });
  }

  async getCouponUsers(influencerId: number) {
    const coupon = await prisma.influencerCoupon.findUnique({
      where: { influencerId },
    });
    if (!coupon) return [];

    return prisma.influencerCouponUsage.findMany({
      where: { couponId: coupon.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        order: {
          select: {
            id: true,
            status: true,
            items: {
              select: { title: true, price: true, quantity: true, size: true, color: true, imageSrc: true },
            },
          },
        },
      },
      orderBy: { usedAt: "desc" },
    });
  }

  // ── Commissions ──

  async createCommission(data: {
    influencerId: number;
    orderId: string;
    orderTotal: number;
    commissionPercent: number;
    commissionAmount: number;
    eligibleAt: Date;
  }) {
    return prisma.influencerCommission.create({ data });
  }

  async getCommissions(influencerId: number) {
    return prisma.influencerCommission.findMany({
      where: { influencerId },
      include: {
        order: { select: { id: true, status: true, createdAt: true } },
        settlement: { select: { id: true, periodStart: true, periodEnd: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updatePendingToEligible() {
    return prisma.influencerCommission.updateMany({
      where: {
        status: "PENDING",
        eligibleAt: { lte: new Date() },
      },
      data: { status: "ELIGIBLE" },
    });
  }

  async getEligibleCommissions() {
    return prisma.influencerCommission.findMany({
      where: {
        status: "ELIGIBLE",
        settlementId: null,
      },
    });
  }

  async settleCommissions(commissionIds: string[], settlementId: string) {
    return prisma.influencerCommission.updateMany({
      where: { id: { in: commissionIds } },
      data: { status: "SETTLED", settlementId },
    });
  }

  // ── Settlements ──

  async createSettlement(data: {
    influencerId: number;
    totalAmount: number;
    periodStart: Date;
    periodEnd: Date;
  }) {
    return prisma.influencerSettlement.create({ data });
  }

  async getSettlements(influencerId: number) {
    return prisma.influencerSettlement.findMany({
      where: { influencerId },
      include: {
        _count: { select: { commissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllSettlements() {
    return prisma.influencerSettlement.findMany({
      include: {
        influencer: { select: { id: true, name: true, email: true } },
        _count: { select: { commissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async markSettlementPaid(id: string) {
    return prisma.influencerSettlement.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });
  }

  // ── Dashboard Stats ──

  async getDashboardStats(influencerId: number) {
    const [totalEarnings, pendingEarnings, eligibleEarnings, settledEarnings] =
      await Promise.all([
        prisma.influencerCommission.aggregate({
          where: { influencerId },
          _sum: { commissionAmount: true },
        }),
        prisma.influencerCommission.aggregate({
          where: { influencerId, status: "PENDING" },
          _sum: { commissionAmount: true },
        }),
        prisma.influencerCommission.aggregate({
          where: { influencerId, status: "ELIGIBLE" },
          _sum: { commissionAmount: true },
        }),
        prisma.influencerCommission.aggregate({
          where: { influencerId, status: "SETTLED" },
          _sum: { commissionAmount: true },
        }),
      ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEarnings = await prisma.influencerCommission.aggregate({
      where: {
        influencerId,
        createdAt: { gte: startOfMonth },
      },
      _sum: { commissionAmount: true },
    });

    return {
      totalEarnings: totalEarnings._sum.commissionAmount || 0,
      pendingEarnings: pendingEarnings._sum.commissionAmount || 0,
      eligibleEarnings: eligibleEarnings._sum.commissionAmount || 0,
      settledEarnings: settledEarnings._sum.commissionAmount || 0,
      currentMonthEarnings: currentMonthEarnings._sum.commissionAmount || 0,
    };
  }
}

export const influencerRepository = new InfluencerRepository();
