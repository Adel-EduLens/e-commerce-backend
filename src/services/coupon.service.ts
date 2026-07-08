import AppError from "../utils/AppError.util.js";
import { couponRepository, CouponCreateInput, CouponUpdateInput } from "../repositories/coupon.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { productRepository } from "../repositories/product.repository.js";

export const couponService = {
  async create(data: CouponCreateInput) {
    const existing = await couponRepository.findByCode(data.code);
    if (existing) {
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

  async getByCode(code: string) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new AppError("Coupon not found or invalid", 404);
    }
    
    // Check expiration
    if (new Date() > new Date(coupon.validUntil)) {
      throw new AppError("Coupon has expired", 400);
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit has been reached", 400);
    }
    
    return coupon;
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
    const coupon = await this.getById(id);

    if (coupon.traderId !== traderId) {
      throw new AppError("You are not authorized to delete this coupon", 403);
    }

    return couponRepository.delete(id);
  }
};
