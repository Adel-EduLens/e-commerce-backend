import { Router } from 'express'
import { requireAdminAuth } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../middlewares/middleware.js'
import {
  deleteImage,
  getImages,
  uploadImage,
  vote,
} from '../controllers/upload.controller.js'

const uploadRouter = Router()

const uploadVoteImage = multerMiddleware({
  getPath: (req) => ['votes'],
})

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
