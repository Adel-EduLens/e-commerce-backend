import Joi from "joi";


export const createShopBannerSchema = Joi.object({
  title: Joi.string().trim().min(2).required(),

  description: Joi.string().trim().required(),

  buttonText: Joi.string().trim().optional(),

  buttonLink: Joi.string().trim().optional(),

  image: Joi.string().trim().required(),

  backgroundColor: Joi.string()
    .trim()
    .optional()
    .default("#C1121F"),

  isActive: Joi.boolean()
    .optional()
    .default(true),

  order: Joi.number()
    .integer()
    .optional()
    .default(0),

  type: Joi.string()
    .trim()
    .valid("shop", "home")
    .optional()
    .default("shop"),
});


export const updateShopBannerSchema = Joi.object({

  title: Joi.string().trim().min(2).optional(),

  description: Joi.string().trim().optional(),

  buttonText: Joi.string().trim().optional(),

  buttonLink: Joi.string().trim().optional(),

  image: Joi.string().trim().optional(),

  backgroundColor: Joi.string().trim().optional(),

  isActive: Joi.boolean().optional(),

  order: Joi.number().integer().optional(),

  type: Joi.string().trim().valid("shop", "home").optional(),

});