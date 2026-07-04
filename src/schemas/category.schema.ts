import Joi from 'joi';
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "Category name is required",
      "string.min": "Category name must be at least 2 characters",
      "any.required": "Category name is required",
    }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .optional()
    .messages({
      "string.min": "Category name must be at least 2 characters",
    }),
});