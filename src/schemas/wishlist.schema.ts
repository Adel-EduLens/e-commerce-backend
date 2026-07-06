import Joi from 'joi'

export const wishlistToggleSchema = Joi.object({
  productType: Joi.string().valid('RETAIL', 'WHOLESALE', 'SHOP').required(),
  productId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).required(),
})

export const wishlistDeleteSchema = Joi.object({
  productType: Joi.string().valid('RETAIL', 'WHOLESALE', 'SHOP').required(),
  productId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).required(),
})

export const wishlistStatusSchema = Joi.object({
  productType: Joi.string().valid('RETAIL', 'WHOLESALE', 'SHOP').required(),
  productId: Joi.alternatives().try(Joi.number().integer().positive(), Joi.string()).required(),
})
