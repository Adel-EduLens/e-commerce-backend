import Joi from 'joi';

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

export const addQuestionSchema = Joi.object({
  question: Joi.string().trim().min(3).max(500).required().messages({
    'string.empty': 'Question cannot be empty',
    'string.min': 'Question must be at least 3 characters',
    'string.max': 'Question cannot exceed 500 characters',
    'any.required': 'Question is required',
  }),
  answer: Joi.string().trim().min(3).max(5000).required().messages({
    'string.empty': 'Answer cannot be empty',
    'string.min': 'Answer must be at least 3 characters',
    'string.max': 'Answer cannot exceed 5000 characters',
    'any.required': 'Answer is required',
  }),
});
