import Joi from 'joi'

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  phone: Joi.string().allow('', null).optional().messages({
    'string.base': 'Phone must be a string',
  }),
  avatar: Joi.string().uri().allow('', null).optional().messages({
    'string.uri': 'Avatar must be a valid URL',
  }),
  dateOfBirth: Joi.date().iso().optional().allow(null).messages({
    'date.format': 'dateOfBirth must be a valid date',
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional().allow(null).messages({
    'any.only': 'Gender must be one of male, female, other, or prefer_not_to_say',
  }),
}).min(1)

export const updateSettingsSchema = Joi.object({
  language: Joi.string().min(2).max(10).optional(),
  currency: Joi.string().min(2).max(10).optional(),
  darkMode: Joi.boolean().optional(),
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  marketingEmails: Joi.boolean().optional(),
}).min(1)

export const createNotifyMeSchema = Joi.object({
  productId: Joi.string().required().messages({
    'any.required': 'productId is required',
  }),
})

export const redeemSchema = Joi.object({
  points: Joi.number().integer().min(1).required().messages({
    'number.base': 'points must be a number',
    'number.integer': 'points must be an integer',
    'number.min': 'points must be at least 1',
    'any.required': 'points is required',
  }),
})
