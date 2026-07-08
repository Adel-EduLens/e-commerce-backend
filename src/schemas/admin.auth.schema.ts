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

export const changeStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'suspended').required().messages({
    'any.only': 'Status must be either active or suspended',
    'any.required': 'Status is required',
  }),
});

export const videoSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required().messages({
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 255 characters',
    'any.required': 'Title is required',
  }),
  category: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Category cannot be empty',
    'string.min': 'Category must be at least 3 characters',
    'string.max': 'Category cannot exceed 100 characters',
    'any.required': 'Category is required',
  }),
  youtubeId: Joi.string().trim().required().messages({
    'string.empty': 'Youtube ID cannot be empty',
    'any.required': 'Youtube ID is required',
  }),
});

export const helpCenterCategorySchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
});
