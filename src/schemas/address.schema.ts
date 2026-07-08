import Joi from "joi"


export const addAddressSchema = Joi.object({
  country: Joi.string().required(),
  city: Joi.string().required(),
  area: Joi.string().required(),
  streetAddress: Joi.string().required(),
  apartment: Joi.string().allow("", null),
})


export const updateAddressSchema = Joi.object({
  country: Joi.string(),
  city: Joi.string(),
  area: Joi.string(),
  streetAddress: Joi.string(),
  apartment: Joi.string().allow("", null),
})