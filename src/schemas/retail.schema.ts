import Joi from 'joi'

export const createRetailCategorySchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  imageUrl: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
})

export const updateRetailCategorySchema = Joi.object({
  name: Joi.string().optional(),
  slug: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  imageUrl: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional()
})

export const createRetailProductSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  shortDescription: Joi.string().optional().allow(''),
  price: Joi.number().required().positive(),
  discountPrice: Joi.number().optional().positive(),
  stock: Joi.number().optional().default(0),
  sku: Joi.string().optional().allow(''),
  brand: Joi.string().optional().allow(''),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  categoryId: Joi.number().required(),
  images: Joi.array()
    .optional()
    .items(
      Joi.object({
        url: Joi.string().required(),
        alt: Joi.string().optional().allow(''),
        isMain: Joi.boolean().optional()
      })
    ),
  colors: Joi.array()
    .optional()
    .items(
      Joi.object({
        name: Joi.string().required(),
        hexCode: Joi.string().optional().allow('')
      })
    ),
  sizes: Joi.array()
    .optional()
    .items(
      Joi.object({
        name: Joi.string().required(),
        stock: Joi.number().optional()
      })
    )
})

export const updateRetailProductSchema = Joi.object({
  name: Joi.string().optional(),
  slug: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  shortDescription: Joi.string().optional().allow(''),
  price: Joi.number().optional().positive(),
  discountPrice: Joi.number().optional().positive(),
  stock: Joi.number().optional(),
  sku: Joi.string().optional().allow(''),
  brand: Joi.string().optional().allow(''),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  categoryId: Joi.number().optional(),
  images: Joi.array()
    .optional()
    .items(
      Joi.object({
        url: Joi.string().required(),
        alt: Joi.string().optional().allow(''),
        isMain: Joi.boolean().optional()
      })
    ),
  colors: Joi.array()
    .optional()
    .items(
      Joi.object({
        name: Joi.string().required(),
        hexCode: Joi.string().optional().allow('')
      })
    ),
  sizes: Joi.array()
    .optional()
    .items(
      Joi.object({
        name: Joi.string().required(),
        stock: Joi.number().optional()
      })
    )
})

export const createRetailNotifyMeSchema = Joi.object({
  userId: Joi.number().required(),
  retailProductId: Joi.number().required()
})

export const retailProductRatingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required()
})
