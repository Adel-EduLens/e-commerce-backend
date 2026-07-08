import { Router } from 'express';
import { createOrder, getUserOrders, getTraderOrders, updateTraderOrderStatus } from '../controllers/order.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getUserOrders);

// Trader routes
router.get('/trader', requireAuth, requireRole('trader'), getTraderOrders);
router.patch('/trader/:id/status', requireAuth, requireRole('trader'), updateTraderOrderStatus);

export default router;
