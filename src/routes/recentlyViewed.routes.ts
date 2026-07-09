import express from 'express'
import { getRecentlyViewed, addRecentlyViewed } from '../controllers/recentlyViewed.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', getRecentlyViewed)
router.post('/add', addRecentlyViewed)

export default router
