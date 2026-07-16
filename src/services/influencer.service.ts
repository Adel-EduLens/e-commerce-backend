import { influencerRepository } from "../repositories/influencer.repository.js";
import { couponRepository } from "../repositories/coupon.repository.js";
import AppError from "../utils/AppError.util.js";
import bcrypt from "bcrypt";

export const influencerService = {
  // ── Admin: Create Influencer ──
  async create(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    couponCode: string;
    discountPercent: number;
    commissionPercent: number;
  }) {
    // Check email uniqueness
    const existingInfluencer = await influencerRepository.findByEmail(data.email);
    if (existingInfluencer) {
      throw new AppError("Email is already registered", 400);
    }

    // Check coupon code uniqueness across both tables
    const code = data.couponCode.trim().toUpperCase();
    const existingInfluencerCoupon = await influencerRepository.findCouponByCode(code);
    if (existingInfluencerCoupon) {
      throw new AppError("Coupon code already exists", 400);
    }
    const existingTraderCoupon = await couponRepository.findByCode(code);
    if (existingTraderCoupon) {
      throw new AppError("Coupon code already exists (used by a trader coupon)", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const influencer = await influencerRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,
    });

    const coupon = await influencerRepository.createCoupon({
      code,
      discountPercent: data.discountPercent,
      commissionPercent: data.commissionPercent,
      influencerId: influencer.id,
    });

    return { influencer, coupon };
  },

  // ── Admin: Get All ──
  async getAll() {
    return influencerRepository.findAll();
  },

  // ── Admin: Get One ──
  async getById(id: number) {
    const influencer = await influencerRepository.findById(id);
    if (!influencer) {
      throw new AppError("Influencer not found", 404);
    }

    const coupon = await influencerRepository.findCouponByInfluencerId(id);
    const stats = await influencerRepository.getDashboardStats(id);

    return { influencer, coupon, stats };
  },

  // ── Admin: Update Influencer ──
  async update(id: number, data: Partial<{
    name: string;
    email: string;
    phone: string;
    status: string;
  }>) {
    const influencer = await influencerRepository.findById(id);
    if (!influencer) {
      throw new AppError("Influencer not found", 404);
    }

    if (data.email && data.email !== influencer.email) {
      const existing = await influencerRepository.findByEmail(data.email);
      if (existing) {
        throw new AppError("Email is already registered", 400);
      }
    }

    return influencerRepository.update(id, data);
  },

  // ── Admin: Update Coupon ──
  async updateCoupon(influencerId: number, data: Partial<{
    code: string;
    discountPercent: number;
    commissionPercent: number;
    isActive: boolean;
  }>) {
    const coupon = await influencerRepository.findCouponByInfluencerId(influencerId);
    if (!coupon) {
      throw new AppError("Influencer coupon not found", 404);
    }

    if (data.code) {
      const code = data.code.trim().toUpperCase();
      data.code = code;

      // Check uniqueness across both tables
      const existingInfluencerCoupon = await influencerRepository.findCouponByCode(code);
      if (existingInfluencerCoupon && existingInfluencerCoupon.id !== coupon.id) {
        throw new AppError("Coupon code already exists", 400);
      }
      const existingTraderCoupon = await couponRepository.findByCode(code);
      if (existingTraderCoupon) {
        throw new AppError("Coupon code already exists (used by a trader coupon)", 400);
      }
    }

    return influencerRepository.updateCoupon(coupon.id, data);
  },

  // ── Influencer Dashboard ──
  async getDashboard(influencerId: number) {
    const influencer = await influencerRepository.findById(influencerId, {
      id: true,
      name: true,
      email: true,
      phone: true,
    });
    if (!influencer) {
      throw new AppError("Influencer not found", 404);
    }

    const coupon = await influencerRepository.findCouponByInfluencerId(influencerId);
    const stats = await influencerRepository.getDashboardStats(influencerId);

    return {
      influencer,
      coupon: coupon
        ? {
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            commissionPercent: coupon.commissionPercent,
            isActive: coupon.isActive,
            totalUsages: coupon._count.usages,
          }
        : null,
      earnings: stats,
    };
  },

  // ── Influencer: Coupon Users ──
  async getCouponUsers(influencerId: number) {
    const usages = await influencerRepository.getCouponUsers(influencerId);

    return usages.map((u) => ({
      userId: u.user.id,
      userName: u.user.name,
      userEmail: u.user.email,
      userPhone: u.user.phone,
      orderId: u.orderId,
      orderTotal: u.orderTotal,
      discountAmount: u.discountAmount,
      commissionAmount: u.commissionAmount,
      usedAt: u.usedAt,
    }));
  },

  // ── Influencer: Commissions ──
  async getCommissions(influencerId: number) {
    return influencerRepository.getCommissions(influencerId);
  },

  // ── Influencer: Settlements ──
  async getSettlements(influencerId: number) {
    return influencerRepository.getSettlements(influencerId);
  },

  // ── Admin: Get All Settlements ──
  async getAllSettlements() {
    return influencerRepository.getAllSettlements();
  },

  // ── Admin: Mark Settlement Paid ──
  async markSettlementPaid(settlementId: string) {
    return influencerRepository.markSettlementPaid(settlementId);
  },
};
