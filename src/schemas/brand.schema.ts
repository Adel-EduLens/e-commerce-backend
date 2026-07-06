import Joi from 'joi';
export const createBrandSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "brand name is required",
      "string.min": "brand name must be at least 2 characters",
      "any.required": "brand name is required",
    }),
});