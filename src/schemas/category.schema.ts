import Joi from "joi";
export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    "string.empty": "Category name is required",
    "string.min": "Category name must be at least 2 characters",
    "any.required": "Category name is required",
  }),

  image: Joi.string().trim().required().messages({
    "string.empty": "Category image is required",
    "any.required": "Category image is required",
  }),

  appearOnHome: Joi.boolean().optional().default(false),
  isWholesale: Joi.boolean().optional().default(false),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).optional().messages({
    "string.min": "Category name must be at least 2 characters",
  }),

  image: Joi.string().trim().optional().allow("", null),

  appearOnHome: Joi.boolean().optional(),
  isWholesale: Joi.boolean().optional(),
});