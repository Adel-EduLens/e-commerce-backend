import Joi from "joi";

export const createInfluencerSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow("", null).optional(),
  couponCode: Joi.string().trim().uppercase().required(),
  discountPercent: Joi.number().positive().max(100).required(),
  commissionPercent: Joi.number().positive().max(100).required(),
});

export const updateInfluencerSchema = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().email().trim().optional(),
  phone: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("active", "suspended").optional(),
});

export const updateInfluencerCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().optional(),
  discountPercent: Joi.number().positive().max(100).optional(),
  commissionPercent: Joi.number().positive().max(100).optional(),
  isActive: Joi.boolean().optional(),
});

export const influencerLoginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().required(),
});
