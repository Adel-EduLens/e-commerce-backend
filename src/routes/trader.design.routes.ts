import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../middlewares/middleware.js'
import {
  deleteImage,
  getImages,
  uploadImage,
  vote,
} from '../controllers/trader.design.controller.js'

const traderDesignRouter = Router()

const uploadVoteImage = multerMiddleware({
  getPath: () => ['votes'],
})

// Public endpoints
traderDesignRouter.get('/images', getImages)

// Authenticated endpoints
traderDesignRouter.put('/vote/:id', requireAuth, vote)

// Trader-only endpoints
traderDesignRouter.post(
  '/',
  requireAuth,
  requireRole('trader'),
  uploadVoteImage.single('image'),
  uploadImage
)

traderDesignRouter.delete('/:id', requireAuth, requireRole('trader'), deleteImage)

export default traderDesignRouter
