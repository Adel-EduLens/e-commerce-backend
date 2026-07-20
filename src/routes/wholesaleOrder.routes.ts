import { Router } from 'express';
import {
  createWholesaleOrder,
  getTraderWholesaleOrders,
  updateTraderWholesaleOrderStatus,
  deleteTraderWholesaleOrder,
  getUserWholesaleOrders,
  updateTraderWholesaleOrder,
} from '../controllers/wholesaleOrder.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, createWholesaleOrder);
router.get('/', requireAuth, getUserWholesaleOrders);
router.get('/trader', requireAuth, requireRole('trader'), getTraderWholesaleOrders);
router.patch('/trader/:id/status', requireAuth, requireRole('trader'), updateTraderWholesaleOrderStatus);
router.patch('/trader/:id', requireAuth, requireRole('trader'), updateTraderWholesaleOrder);
router.delete('/trader/:id', requireAuth, requireRole('trader'), deleteTraderWholesaleOrder);

export default router;
