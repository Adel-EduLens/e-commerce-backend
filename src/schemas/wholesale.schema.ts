import Joi from "joi";

const wholesaleImageSchema = Joi.object({
  url: Joi.string().required(),
  color: Joi.string().allow("", null).optional(),
});

export const createWholesaleSchema = Joi.object({
  name: Joi.string().trim().required(),

  description: Joi.string().allow("", null),

  price: Joi.number().positive().required(),

  minOrder: Joi.number().integer().min(1).optional(),

  isBestDeal: Joi.boolean().optional(),
  isMostPopular: Joi.boolean().optional(),
  isPremiumCollection: Joi.boolean().optional(),

  brand: Joi.string().allow("", null),

  rating: Joi.number().min(0).max(5).optional(),

  categoryId: Joi.string().required(),

  sku: Joi.string().allow("", null),
  stock: Joi.number().integer().min(0).optional(),

  images: Joi.array().items(wholesaleImageSchema).min(1).required(),
});

export const updateWholesaleSchema = Joi.object({
  name: Joi.string().trim(),

  description: Joi.string().allow("", null),

  price: Joi.number().positive(),

  minOrder: Joi.number().integer().min(1),

  isBestDeal: Joi.boolean(),
  isMostPopular: Joi.boolean(),
  isPremiumCollection: Joi.boolean(),

  brand: Joi.string().allow("", null),

  rating: Joi.number().min(0).max(5),

  categoryId: Joi.string(),

  sku: Joi.string().allow("", null),
  stock: Joi.number().integer().min(0),

  images: Joi.array().items(wholesaleImageSchema),
});
