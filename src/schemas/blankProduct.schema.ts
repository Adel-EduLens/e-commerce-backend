import Joi from "joi";
import { ImageDirection } from "@prisma/client";

const materialSchema = Joi.object({
  material: Joi.string().trim().required(),
});

const imageSchema = Joi.object({
  url: Joi.string().uri().required(),

  direction: Joi.string()
    .valid(...Object.values(ImageDirection))
    .required(),
});

const colorSchema = Joi.object({
  color: Joi.string().trim().required(),

  images: Joi.array()
    .items(imageSchema)
    .min(1)
    .required(),
});

export const createBlankProductSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),

  description: Joi.string().allow("", null),

  price: Joi.number().min(0).allow(null),

  isActive: Joi.boolean().default(true),

  materials: Joi.array()
    .items(materialSchema)
    .min(1)
    .required(),

  colors: Joi.array()
    .items(colorSchema)
    .min(1)
    .required(),
});

export const updateBlankProductSchema = Joi.object({
  name: Joi.string().trim().min(2),

  description: Joi.string().allow("", null),

  price: Joi.number().min(0).allow(null),

  isActive: Joi.boolean(),

  materials: Joi.array()
    .items(materialSchema)
    .min(1),

  colors: Joi.array()
    .items(colorSchema)
    .min(1),
}).min(1);