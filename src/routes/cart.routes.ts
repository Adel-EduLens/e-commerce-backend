import express from 'express';
import { getCart, addItem, updateItem, removeItem, clearCart } from '../controllers/cart.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addItem);
router.post('/retail-items', addItem);
router.patch('/items/:id', updateItem);
router.delete('/items/:id', removeItem);
router.delete('/items', clearCart);

export default router;
