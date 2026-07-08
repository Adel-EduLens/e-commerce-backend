import express from 'express'
import { getWishlist, getWishlistStatus, toggleWishlist } from '../controllers/wishlist.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', getWishlist)
router.get('/status', getWishlistStatus)
router.post('/toggle', toggleWishlist)

export default router
