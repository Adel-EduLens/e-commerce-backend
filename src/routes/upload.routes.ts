import { Router } from 'express'
import { requireAdminAuth, requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../middlewares/middleware.js'
import {
  deleteImage,
  getImages,
  uploadImage,
  uploadProductImage,
  vote,
} from '../controllers/upload.controller.js'

const uploadRouter = Router()

const uploadVoteImage = multerMiddleware({
  getPath: (req) => ['votes'],
})

const uploadProductImg = multerMiddleware({
  getPath: (req) => ['products'],
})

uploadRouter.post(
  '/product-image',
  requireAuth,
  requireRole('trader'),
  uploadProductImg.single('image'),
  uploadProductImage,
)

uploadRouter.post(
  '/',
  requireAdminAuth,
  uploadVoteImage.single('image'),
  uploadImage
)

uploadRouter.get('/images', getImages)

uploadRouter.put('/vote/:id', vote)

uploadRouter.delete('/:id', requireAdminAuth, deleteImage)

export default uploadRouter
