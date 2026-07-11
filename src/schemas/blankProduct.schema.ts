import Joi from "joi";


const colorSchema = Joi.object({
  color: Joi.string().required(),
});


const imageSchema = Joi.object({
  url: Joi.string().uri().required(),
  color: Joi.string().required(),
});


export const createBlankProductSchema = Joi.object({

  name: Joi.string()
    .required()
    .min(2),

  description: Joi.string()
    .allow("", null),

  material: Joi.string()
    .required(),

  pattern: Joi.string()
    .required(),

  price: Joi.number()
    .min(0)
    .allow(null),

  isActive: Joi.boolean()
    .default(true),


  colors: Joi.array()
    .items(colorSchema)
    .min(1)
    .required(),


  images: Joi.array()
    .items(imageSchema)
    .min(1)
    .required(),

});


export const updateBlankProductSchema = Joi.object({

  name: Joi.string()
    .min(2),

  description: Joi.string()
    .allow("", null),

  material: Joi.string(),

  pattern: Joi.string(),

  price: Joi.number()
    .min(0)
    .allow(null),

  isActive: Joi.boolean(),


  colors: Joi.array()
    .items(colorSchema)
    .min(1),


  images: Joi.array()
    .items(imageSchema)
    .min(1),

});