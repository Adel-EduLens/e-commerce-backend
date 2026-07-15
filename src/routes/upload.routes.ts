import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../middlewares/middleware.js'
import {
  uploadCategoryImage,
  uploadProductImage,
  uploadRetailCategoryImage,
  uploadRetailProductImage,
} from '../controllers/upload.controller.js'

const uploadRouter = Router()

const uploadProductImg = multerMiddleware({
  getPath: (req) => ['products'],
})
const uploadCategoryImg = multerMiddleware({
  getPath: (req) => ['categories'],
})
const uploadRetailCategoryImg = multerMiddleware({
  getPath: (req) => ['retail-categories'],
})
const uploadRetailProductImg = multerMiddleware({
  getPath: (req) => ['retail-products'],
})

uploadRouter.post(
  '/category-image',
  requireAuth,
  requireRole('trader'),
  uploadCategoryImg.single('image'),
  uploadCategoryImage,
)
uploadRouter.post(
  '/retail-category-image',
  requireAuth,
  requireRole('trader'),
  uploadRetailCategoryImg.single('image'),
  uploadRetailCategoryImage,
)
uploadRouter.post(
  '/retail-product-image',
  requireAuth,
  requireRole('trader'),
  uploadRetailProductImg.single('image'),
  uploadRetailProductImage,
)
uploadRouter.post(
  '/product-image',
  requireAuth,
  requireRole('trader'),
  uploadProductImg.single('image'),
  uploadProductImage,
)

export default uploadRouter
