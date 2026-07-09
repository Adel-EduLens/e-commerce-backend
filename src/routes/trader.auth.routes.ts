import { Router } from 'express'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { adminLoginSchema } from '../schemas/admin.auth.schema.js'
import { traderLogin, getTraderMe, updateTraderMe } from '../controllers/trader.auth.controller.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../middlewares/middleware.js'
import {
  createTraderProduct,
  getTraderProductById,
  deleteTraderProduct,
  addTraderProductColor,
  deleteTraderProductColor,
  replaceTraderProductColorImages,
  addTraderProductColorImages,
  deleteTraderProductImage,
  updateTraderProductSizeQuantity,
  addTraderProductSize,
  deleteTraderProductSize,
} from '../controllers/traderProduct.controller.js'

const traderRouter = Router()

const uploadProductImg = multerMiddleware({
  getPath: (req) => ['products'],
})

// Authentication
traderRouter.post('/login', validateRequest(adminLoginSchema), traderLogin)
traderRouter.get('/me', requireAuth, requireRole('trader'), getTraderMe)
traderRouter.patch('/me', requireAuth, requireRole('trader'), updateTraderMe)

// Trader Products CRUD
traderRouter.post(
  '/products',
  requireAuth,
  requireRole('trader'),
  uploadProductImg.any(),
  createTraderProduct
)
traderRouter.get(
  '/products/:id',
  requireAuth,
  requireRole('trader'),
  getTraderProductById
)
traderRouter.delete(
  '/products/:id',
  requireAuth,
  requireRole('trader'),
  deleteTraderProduct
)

// Trader Product Colors
traderRouter.post(
  '/products/:productId/colors',
  requireAuth,
  requireRole('trader'),
  uploadProductImg.any(),
  addTraderProductColor
)
traderRouter.delete(
  '/products/colors/:colorId',
  requireAuth,
  requireRole('trader'),
  deleteTraderProductColor
)

// Trader Product Color Images
traderRouter.put(
  '/products/colors/:colorId/images',
  requireAuth,
  requireRole('trader'),
  uploadProductImg.any(),
  replaceTraderProductColorImages
)
traderRouter.post(
  '/products/colors/:colorId/images',
  requireAuth,
  requireRole('trader'),
  uploadProductImg.any(),
  addTraderProductColorImages
)
traderRouter.delete(
  '/products/images/:imageId',
  requireAuth,
  requireRole('trader'),
  deleteTraderProductImage
)

// Trader Product Sizes / Variants
traderRouter.patch(
  '/products/variants/:variantId',
  requireAuth,
  requireRole('trader'),
  updateTraderProductSizeQuantity
)
traderRouter.post(
  '/products/colors/:colorId/sizes',
  requireAuth,
  requireRole('trader'),
  addTraderProductSize
)
traderRouter.delete(
  '/products/variants/:variantId',
  requireAuth,
  requireRole('trader'),
  deleteTraderProductSize
)

export default traderRouter

