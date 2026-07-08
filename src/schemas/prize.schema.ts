import Joi from "joi";

export const createPrizeSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  weight: Joi.number().integer().positive().required(),
});


