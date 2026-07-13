import Joi from "joi";

export const createHomeBannerSchema = Joi.object({
  title: Joi.string().trim().required(),
  image: Joi.string().trim().optional().allow(null, ""),
  order: Joi.number().integer().optional().default(0),
});

export const updateHomeBannerSchema = Joi.object({
  title: Joi.string().trim().optional(),
  image: Joi.string().trim().optional().allow(null, ""),
  order: Joi.number().integer().optional(),
});
