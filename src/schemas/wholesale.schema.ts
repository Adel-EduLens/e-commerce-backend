import Joi from "joi";

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

  images: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),

  sizes: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),

  colors: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),
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

  images: Joi.array().items(Joi.string()),

  sizes: Joi.array().items(Joi.string()),

  colors: Joi.array().items(Joi.string()),
});
