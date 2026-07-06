import Joi from "joi";

const imageSchema = Joi.object({
  url: Joi.string().required(),
  color: Joi.string().required(),
});


export const createProductSchema = Joi.object({
  name: Joi.string().trim().required(),

  description: Joi.string().allow("", null),

  price: Joi.number().positive().required(),

  brandId: Joi.string().allow("", null),

  rating: Joi.number().min(0).max(5).optional(),
  sizeguide: Joi.string().allow("", null),
  reviews: Joi.string().allow("", null),

  categoryId: Joi.string().required(),

  images: Joi.array().items(imageSchema).min(1).required(),

  sizes: Joi.array().items(Joi.string().required()).min(1).required(),

  colors: Joi.array().items(Joi.string().required()).min(1).required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim(),
  sizeguide: Joi.string().allow("", null),
  description: Joi.string().allow("", null),

  price: Joi.number().positive(),

  brandId: Joi.string().allow("", null),

  rating: Joi.number().min(0).max(5),

  reviews: Joi.string().allow("", null),

  categoryId: Joi.string(),

  images: Joi.array().items(imageSchema),

  sizes: Joi.array().items(Joi.string()),

  colors: Joi.array().items(Joi.string()),
});
