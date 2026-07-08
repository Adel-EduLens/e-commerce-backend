import { Router } from 'express';
import { createOrder, getUserOrders } from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getUserOrders);

export default router;
