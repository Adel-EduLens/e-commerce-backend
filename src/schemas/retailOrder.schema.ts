import Joi from 'joi'

export const createRetailOrderSchema = Joi.object({
  productId: Joi.number().required(),

  idCardImage: Joi.string().required(),

  startDate: Joi.date().required(),
  endDate: Joi.date()
    .required()
    .greater(Joi.ref('startDate'))
})


export const payDepositSchema = Joi.object({
  paymentId: Joi.string().optional()
})


export const updateRetailOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'PENDING',
      'APPROVED',
      'ACTIVE',
      'COMPLETED',
      'CANCELLED'
    )
    .required()
})