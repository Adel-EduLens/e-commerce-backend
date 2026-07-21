import Joi from "joi";

export const createShippingCountrySchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    "string.empty": "Country name is required",
    "string.min": "Country name must be at least 2 characters",
    "any.required": "Country name is required",
  }),
  code: Joi.string().trim().uppercase().max(5).optional().allow("", null),
});

export const updateShippingCountrySchema = Joi.object({
  name: Joi.string().trim().min(2).optional().messages({
    "string.empty": "Country name cannot be empty",
    "string.min": "Country name must be at least 2 characters",
  }),
  code: Joi.string().trim().uppercase().max(5).optional().allow("", null),
}).min(1);

export const createShippingCitySchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    "string.empty": "City name is required",
    "string.min": "City name must be at least 2 characters",
    "any.required": "City name is required",
  }),
  shippingCost: Joi.number().min(0).default(0).messages({
    "number.base": "Shipping cost must be a number",
    "number.min": "Shipping cost cannot be negative",
  }),
  countryId: Joi.string().trim().required().messages({
    "string.empty": "Country ID is required",
    "any.required": "Country ID is required",
  }),
});

export const updateShippingCitySchema = Joi.object({
  name: Joi.string().trim().min(2).optional().messages({
    "string.empty": "City name cannot be empty",
    "string.min": "City name must be at least 2 characters",
  }),
  shippingCost: Joi.number().min(0).optional().messages({
    "number.base": "Shipping cost must be a number",
    "number.min": "Shipping cost cannot be negative",
  }),
  countryId: Joi.string().trim().optional().messages({
    "string.empty": "Country ID cannot be empty",
  }),
}).min(1);
