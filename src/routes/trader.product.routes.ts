import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { multerMiddleware } from '../middlewares/middleware.js'
import {
  createTraderProduct,
  addProductColor,
  deleteProductColor,
  replaceProductColorImages,
  addProductColorImages,
  deleteProductImage,
  updateProductVariant,
  addProductSize,
  deleteProductVariant,
} from '../controllers/trader.product.controller.js'

const router = Router()

router.use(requireAuth, requireRole('trader'))

const upload = multerMiddleware({ getPath: () => ['products'] })

// Create product with images
router.post('/', upload.any(), createTraderProduct)

// Color management
router.post('/:productId/colors', upload.any(), addProductColor)
router.delete('/colors/:colorId', deleteProductColor)

// Image management
router.put('/colors/:colorId/images', upload.any(), replaceProductColorImages)
router.post('/colors/:colorId/images', upload.any(), addProductColorImages)
router.delete('/images/:imageId', deleteProductImage)

// Size/variant management
router.patch('/variants/:variantId', updateProductVariant)
router.post('/colors/:colorId/sizes', addProductSize)
router.delete('/variants/:variantId', deleteProductVariant)

export default router
