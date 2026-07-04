import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required(),

  description: Joi.string().allow("", null),

  price: Joi.number().positive().required(),

  brand: Joi.string().allow("", null),

  rating: Joi.number().min(0).max(5).optional(),

  reviews: Joi.string().allow("", null),

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

export const updateProductSchema = Joi.object({
  name: Joi.string().trim(),

  description: Joi.string().allow("", null),

  price: Joi.number().positive(),

  brand: Joi.string().allow("", null),

  rating: Joi.number().min(0).max(5),

  reviews: Joi.string().allow("", null),

  categoryId: Joi.string(),

  images: Joi.array().items(Joi.string()),

  sizes: Joi.array().items(Joi.string()),

  colors: Joi.array().items(Joi.string()),
});