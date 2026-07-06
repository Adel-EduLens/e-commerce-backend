import express from 'express'
import { rateProductUnified } from '../controllers/retailProductRating.controller.js'
import { optionalAuth } from '../middlewares/auth.middleware.js'

const router = express.Router()

// POST /api/ratings  { productType, productId, rating }
router.post('/', optionalAuth, rateProductUnified)

export default router
