import express from 'express'
import {
  getWishlist,
  getWishlistStatus,
  toggleWishlist,
  deleteWishlist,
} from '../controllers/wishlist.controller.js'
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import {
  wishlistToggleSchema,
  wishlistDeleteSchema,
} from '../schemas/wishlist.schema.js'

const router = express.Router()

router.get('/', optionalAuth, getWishlist)
router.get('/status', optionalAuth, getWishlistStatus)
router.post('/toggle', optionalAuth, validateRequest(wishlistToggleSchema), toggleWishlist)
router.delete('/', requireAuth, validateRequest(wishlistDeleteSchema), deleteWishlist)

export default router
