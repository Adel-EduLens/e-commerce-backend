import Joi from "joi";

export const createCollectionSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    "string.empty": "Collection name is required",
    "string.min": "Collection name must be at least 2 characters",
    "any.required": "Collection name is required",
  }),

  description: Joi.string().trim().optional().allow("", null),

  image: Joi.string().trim().required().messages({
    "string.empty": "Collection image is required",
    "any.required": "Collection image is required",
  }),

  appearOnHome: Joi.boolean().optional().default(true),

  productIds: Joi.array().items(Joi.string()).optional().default([]),
});

export const updateCollectionSchema = Joi.object({
  name: Joi.string().trim().min(2).optional().messages({
    "string.min": "Collection name must be at least 2 characters",
  }),

  description: Joi.string().trim().optional().allow("", null),

  image: Joi.string().trim().optional().allow("", null),

  appearOnHome: Joi.boolean().optional(),

  productIds: Joi.array().items(Joi.string()).optional(),
});
