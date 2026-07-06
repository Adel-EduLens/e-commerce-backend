import Joi from 'joi'

export const addCartItemSchema = Joi.object({
  userId: Joi.number().optional(),
  productId: Joi.string().optional().allow(null),
  retailProductId: Joi.number().optional().allow(null),
  retailColorId: Joi.number().optional().allow(null),
  retailSizeId: Joi.number().optional().allow(null),
  quantity: Joi.number().integer().min(1).required()
}).oxor('productId', 'retailProductId')

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
})
