import express from 'express'
import {
  getCart,
  addCartItem,
  addRetailCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cart.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { addCartItemSchema, updateCartItemSchema } from '../schemas/cart.schema.js'

const router = express.Router()

router.get('/', requireAuth, getCart)
router.post('/items', requireAuth, validateRequest(addCartItemSchema), addCartItem)
router.post('/retail-items', requireAuth, validateRequest(addCartItemSchema), addRetailCartItem)
router.patch('/items/:itemId', requireAuth, validateRequest(updateCartItemSchema), updateCartItem)
router.delete('/items/:itemId', requireAuth, removeCartItem)
router.delete('/clear', requireAuth, clearCart)

export default router
