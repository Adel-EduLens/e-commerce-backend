import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().required(),
  discount: Joi.number().positive().required(),
  validUntil: Joi.date().greater('now').required(),
  categoryId: Joi.string().allow("", null).optional(),
  productId: Joi.string().allow("", null).optional(),
  usageLimit: Joi.number().integer().positive().allow(null, "").optional(),
});

export const updateCouponSchema = Joi.object({
  code: Joi.string().trim().uppercase().optional(),
  discount: Joi.number().positive().optional(),
  validUntil: Joi.date().greater('now').optional(),
  categoryId: Joi.string().allow("", null).optional(),
  productId: Joi.string().allow("", null).optional(),
  usageLimit: Joi.number().integer().positive().allow(null, "").optional(),
  isActive: Joi.boolean().optional(),
});
