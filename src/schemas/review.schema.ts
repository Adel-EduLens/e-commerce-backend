import Joi from "joi";

export const createReviewSchema = Joi.object({
  productId: Joi.string().required(),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  comment: Joi.string()
    .trim()
    .max(1000)
    .allow("")
    .optional(),
});

export const updateReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),

  comment: Joi.string()
    .trim()
    .max(1000)
    .allow("")
    .optional(),
}).min(1);