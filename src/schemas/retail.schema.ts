import Joi from "joi";


export const createRetailBrandSchema = Joi.object({
  name: Joi.string().trim().required(),
});


export const updateRetailBrandSchema = Joi.object({
  name: Joi.string().trim().required(),
});


export const createRetailCategorySchema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().allow("").optional(),
  appearOnHome: Joi.boolean().optional(),
});

export const updateRetailCategorySchema = Joi.object({
  name: Joi.string().optional(),
  image: Joi.string().allow("").optional(),
  appearOnHome: Joi.boolean().optional(),
});

export const createRetailProductSchema = Joi.object({
  name: Joi.string().required(),

  description: Joi.string().optional().allow(""),

  price: Joi.number().required().positive(),

  stock: Joi.number().optional().default(0),

  sku: Joi.string().optional().allow(""),

  brandId: Joi.string().optional().allow(null, ""),

  isFeatured: Joi.boolean().optional(),

  categoryId: Joi.string().required(),

  images: Joi.array()
    .optional()
    .items(
      Joi.object({
        url: Joi.string().required(),
        color: Joi.string().optional().allow(""),
      }),
    ),

  colors: Joi.array().optional().items(Joi.string()),

  sizes: Joi.array()
    .optional()
    .items(
      Joi.alternatives().try(
        Joi.string(),

        Joi.object({
          size: Joi.string().required(),
          quantity: Joi.number().optional(),
          color: Joi.string().optional().allow(""),
        }),
      ),
    ),

  depositAmount: Joi.number().required().positive(),

  securityDeposit: Joi.number().required().positive(),

  termsAndConditions: Joi.string().optional().allow(""),

  privacyPolicy: Joi.string().optional().allow(""),
});

export const updateRetailProductSchema = Joi.object({
  name: Joi.string().optional(),

  description: Joi.string().optional().allow(""),

  price: Joi.number().optional().positive(),

  stock: Joi.number().optional(),

  sku: Joi.string().optional().allow(""),

  brandId: Joi.string().optional().allow(null, ""),

  isFeatured: Joi.boolean().optional(),

  categoryId: Joi.string().optional(),

  images: Joi.array()
    .optional()
    .items(
      Joi.object({
        url: Joi.string().required(),
        color: Joi.string().optional().allow(""),
      }),
    ),

  colors: Joi.array().optional().items(Joi.string()),

  sizes: Joi.array()
    .optional()
    .items(
      Joi.alternatives().try(
        Joi.string(),

        Joi.object({
          size: Joi.string().required(),
          quantity: Joi.number().optional(),
          color: Joi.string().optional().allow(""),
        }),
      ),
    ),

  depositAmount: Joi.number().optional().positive(),

  securityDeposit: Joi.number().optional().positive(),

  termsAndConditions: Joi.string().optional().allow(""),

  privacyPolicy: Joi.string().optional().allow(""),
});

export const createRetailNotifyMeSchema = Joi.object({
  userId: Joi.number().required(),
  retailProductId: Joi.number().required(),
});




export const createRetailReviewSchema = Joi.object({
  retailProductId: Joi.number().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow("").optional(),
});


export const updateRetailReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().allow("").optional(),
});
