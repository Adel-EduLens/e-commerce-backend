import AppError from "../utils/AppError.util.js";
import { couponRepository, CouponCreateInput, CouponUpdateInput } from "../repositories/coupon.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { influencerRepository } from "../repositories/influencer.repository.js";

export const couponService = {
  async create(data: CouponCreateInput) {
    const existing = await couponRepository.findByCode(data.code);
    if (existing) {
      throw new AppError("Coupon code already exists", 400);
    }

    // Check influencer coupons too
    const existingInfluencer = await influencerRepository.findCouponByCode(data.code);
    if (existingInfluencer) {
      throw new AppError("Coupon code already exists", 400);
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    if (data.productId) {
      const product = await productRepository.findById(data.productId);
      if (!product) {
        throw new AppError("Product not found", 404);
      }
    }

    return couponRepository.create(data);
  },

  async getAll(filter?: { traderId?: number }) {
    return couponRepository.findAll(filter);
  },

  async getById(id: string) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }
    return coupon;
  },

  async getByCode(code: string, userId?: number) {
    // First check if it's an influencer coupon
    const influencerCoupon = await influencerRepository.findCouponByCode(code);
    if (influencerCoupon) {
      if (!influencerCoupon.isActive) {
        throw new AppError("Coupon is inactive", 400);
      }
      if (influencerCoupon.influencer.status !== "active") {
        throw new AppError("Coupon is inactive", 400);
      }

      // Check one-time-per-user rule
      if (userId) {
        const existingUsage = await influencerRepository.findCouponUsage(
          influencerCoupon.id,
          userId
        );
        if (existingUsage) {
          throw new AppError("You have already used this coupon", 400);
        }
      }

      return {
        id: influencerCoupon.id,
        code: influencerCoupon.code,
        discount: influencerCoupon.discountPercent,
        type: "influencer" as const,
        isActive: influencerCoupon.isActive,
      };
    }

    // Fall through to trader coupon
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new AppError("Coupon not found or invalid", 404);
    }

    // Check if active
    if (!coupon.isActive) {
      throw new AppError("Coupon is inactive", 400);
    }

    // Check expiration
    if (new Date() > new Date(coupon.validUntil)) {
      throw new AppError("Coupon has expired", 400);
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit has been reached", 400);
    }

    return { ...coupon, type: "trader" as const };
  },

  async use(code: string, userId: number) {
    const coupon = await this.getByCode(code);
    return couponRepository.incrementUsedCount(coupon.code, userId);
  },

  async update(id: string, traderId: number, data: CouponUpdateInput) {
    const coupon = await this.getById(id);
    
    if (coupon.traderId !== traderId) {
      throw new AppError("You are not authorized to update this coupon", 403);
    }

    if (data.code) {
      const existing = await couponRepository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new AppError("Coupon code already exists", 400);
      }
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    if (data.productId) {
      const product = await productRepository.findById(data.productId);
      if (!product) {
        throw new AppError("Product not found", 404);
      }
    }

    return couponRepository.update(id, data);
  },

  async delete(id: string, traderId: number) {
    throw new AppError("Deleting coupons is not permitted. Please deactivate instead.", 403);
  }
};
