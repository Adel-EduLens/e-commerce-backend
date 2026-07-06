import express from 'express'
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/retailCategory.controller.js'
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/retailProduct.controller.js'
import {
  rateRetailProduct,
  getRetailProductRating,
} from '../controllers/retailProductRating.controller.js'
import {
  getUserNotifications,
  createNotification,
  deleteNotification,
  deleteNotificationByProduct
} from '../controllers/retailNotifyMe.controller.js'
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import {
  createRetailCategorySchema,
  updateRetailCategorySchema,
  createRetailProductSchema,
  updateRetailProductSchema,
  createRetailNotifyMeSchema
} from '../schemas/retail.schema.js'

const router = express.Router()

// ===== Retail Categories =====
router.get('/categories', getAllCategories)
router.get('/categories/:id', getCategoryById)
router.get('/categories/slug/:slug', getCategoryBySlug)
router.post('/categories', validateRequest(createRetailCategorySchema), createCategory)
router.put('/categories/:id', validateRequest(updateRetailCategorySchema), updateCategory)
router.delete('/categories/:id', deleteCategory)

// ===== Retail Products =====
router.get('/products', getAllProducts)
router.get('/products/:id', getProductById)
router.get('/products/slug/:slug', getProductBySlug)
router.post('/products', validateRequest(createRetailProductSchema), createProduct)
router.put('/products/:id', validateRequest(updateRetailProductSchema), updateProduct)
router.delete('/products/:id', deleteProduct)
router.post('/products/:id/rating', requireAuth, rateRetailProduct)
router.get('/products/:id/rating', optionalAuth, getRetailProductRating)

// ===== Retail Notify Me =====
router.get('/notify-me/user/:userId', getUserNotifications)
router.post('/notify-me', validateRequest(createRetailNotifyMeSchema), createNotification)
router.delete('/notify-me/:id', deleteNotification)
router.delete('/notify-me/user/:userId/product/:retailProductId', deleteNotificationByProduct)

export default router
