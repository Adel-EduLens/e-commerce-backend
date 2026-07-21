import Joi from "joi";
import { ProductType } from "@prisma/client";

// ============ Sub-schemas ============

const imageSchema = Joi.object({
  url: Joi.string().required(),
  color: Joi.string().allow("", null).optional(),
  direction: Joi.string()
    .valid("FRONT", "BACK", "LEFT", "RIGHT", "TOP", "BOTTOM")
    .optional()
    .allow("", null),
  colorId: Joi.string().optional().allow(null),
});

const sizeSchema = Joi.alternatives().try(
  Joi.string(),
  Joi.object({
    size: Joi.string().required(),
    quantity: Joi.number().integer().min(0).optional(),
    color: Joi.string().optional().allow("", null),
    productColorId: Joi.string().optional().allow(null),
  }),
);

const colorSchema = Joi.object({
  color: Joi.string().required(),
  name: Joi.string().optional().allow("", null),
  code: Joi.string().optional().allow("", null),
  minOrder: Joi.number().integer().min(1).optional(),
  stock: Joi.number().integer().min(0).optional(),
  sizes: Joi.array()
    .items(
      Joi.object({
        size: Joi.string().required(),
        quantity: Joi.number().integer().min(0).optional(),
      }),
    )
    .optional(),
});

const materialSchema = Joi.object({
  material: Joi.string().trim().required(),
});

const validProductTypes = Object.values(ProductType);

// ============ Create Schema ============

export const createProductSchema = Joi.object({
  // --- Required base ---
  productTypes: Joi.array()
    .items(Joi.string().valid(...validProductTypes))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one productType is required",
      "any.required": "productTypes is required",
    }),

  name: Joi.string().trim().required(),
  sku: Joi.string().trim().required().messages({
    "any.required": "sku is required",
    "string.empty": "sku cannot be empty",
  }),

  description: Joi.string().allow("", null).optional(),
  stock: Joi.number().integer().min(0).optional(),
  rating: Joi.number().min(0).max(5).optional(),

  categoryIds: Joi.array()
    .items(Joi.string())
    .when("productTypes", {
      is: Joi.array().items(Joi.valid(ProductType.BLANK)).min(1),
      then: Joi.array().items(Joi.string()).allow(null),
      otherwise: Joi.array().items(Joi.string()).min(1).required(),
    }),
  brandId: Joi.string().allow("", null).optional(),

  images: Joi.array().items(imageSchema).optional(),
  sizes: Joi.array().items(sizeSchema).optional(),
  colors: Joi.array().items(colorSchema).optional(),
  materials: Joi.array().items(materialSchema).optional(),

  // --- SHOP fields ---
  shopPrice: Joi.when("productTypes", {
    is: Joi.array().has(ProductType.SHOP),
    then: Joi.number().positive().required().messages({
      "any.required": "shopPrice is required for SHOP products",
      "number.base": "shopPrice must be a number",
    }),
    otherwise: Joi.number().positive().optional().allow(null),
  }),
  sizeguide: Joi.string().allow("", null).optional(),
  isMustHave: Joi.boolean().optional(),
  isFlashDeals: Joi.boolean().optional(),
  flashDealPrice: Joi.number().positive().allow(null).optional(),
  flashDealEndsAt: Joi.date().iso().allow(null).optional(),

  // --- RETAIL fields ---
  retailPrice: Joi.when("productTypes", {
    is: Joi.array().has(ProductType.RETAIL),
    then: Joi.number().positive().required().messages({
      "any.required": "retailPrice is required for RETAIL products",
    }),
    otherwise: Joi.number().positive().optional().allow(null),
  }),
  depositAmount: Joi.when("productTypes", {
    is: Joi.array().has(ProductType.RETAIL),
    then: Joi.number().positive().required().messages({
      "any.required": "depositAmount is required for RETAIL products",
    }),
    otherwise: Joi.number().positive().optional().allow(null),
  }),
  securityDeposit: Joi.when("productTypes", {
    is: Joi.array().has(ProductType.RETAIL),
    then: Joi.number().positive().required().messages({
      "any.required": "securityDeposit is required for RETAIL products",
    }),
    otherwise: Joi.number().positive().optional().allow(null),
  }),
  termsAndConditions: Joi.string().allow("", null).optional(),
  privacyPolicy: Joi.string().allow("", null).optional(),
  isFeatured: Joi.boolean().optional(),

  // --- WHOLESALE fields ---
  wholesalePrice: Joi.when("productTypes", {
    is: Joi.array().has(ProductType.WHOLESALE),
    then: Joi.number().positive().required().messages({
      "any.required": "wholesalePrice is required for WHOLESALE products",
    }),
    otherwise: Joi.number().positive().optional().allow(null),
  }),
  minOrder: Joi.number().integer().min(1).optional(),
  isBestDeal: Joi.boolean().optional(),
  isMostPopular: Joi.boolean().optional(),
  isPremiumCollection: Joi.boolean().optional(),

  // --- BLANK fields ---
  blankPrice: Joi.number().min(0).allow(null).optional(),
  isActive: Joi.boolean().optional(),
});

// ============ Update Schema ============

export const updateProductSchema = Joi.object({
  productTypes: Joi.array()
    .items(Joi.string().valid(...validProductTypes))
    .min(1)
    .optional(),

  name: Joi.string().trim().optional(),
  sku: Joi.string().trim().optional().allow(null),
  description: Joi.string().allow("", null).optional(),
  stock: Joi.number().integer().min(0).optional(),
  rating: Joi.number().min(0).max(5).optional(),

  categoryIds: Joi.array()
    .items(Joi.string())
    .when("productTypes", {
      is: Joi.array().items(Joi.valid(ProductType.BLANK)).min(1),
      then: Joi.optional().allow(null),
      otherwise: Joi.optional(), // update is always optional, but if they pass an array, min length might be validated if not blank. Let's just allow empty array if BLANK.
    })
    .allow(null),
  brandId: Joi.string().allow("", null).optional(),

  images: Joi.array().items(imageSchema).optional(),
  sizes: Joi.array().items(sizeSchema).optional(),
  colors: Joi.array().items(colorSchema).optional(),
  materials: Joi.array().items(materialSchema).optional(),

  // SHOP
  shopPrice: Joi.number().positive().optional().allow(null),
  sizeguide: Joi.string().allow("", null).optional(),
  isMustHave: Joi.boolean().optional(),
  isFlashDeals: Joi.boolean().optional(),
  flashDealPrice: Joi.number().positive().allow(null).optional(),
  flashDealEndsAt: Joi.date().iso().allow(null).optional(),

  // RETAIL
  retailPrice: Joi.number().positive().optional().allow(null),
  depositAmount: Joi.number().positive().optional().allow(null),
  securityDeposit: Joi.number().positive().optional().allow(null),
  termsAndConditions: Joi.string().allow("", null).optional(),
  privacyPolicy: Joi.string().allow("", null).optional(),
  isFeatured: Joi.boolean().optional(),

  // WHOLESALE
  wholesalePrice: Joi.number().positive().optional().allow(null),
  minOrder: Joi.number().integer().min(1).optional(),
  isBestDeal: Joi.boolean().optional(),
  isMostPopular: Joi.boolean().optional(),
  isPremiumCollection: Joi.boolean().optional(),

  // BLANK
  blankPrice: Joi.number().min(0).allow(null).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);
