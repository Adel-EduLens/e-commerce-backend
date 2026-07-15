import express from 'express'
import { requireAuth } from '../middlewares/auth.middleware.js'
import {
  getSubscriptions,
  checkSubscription,
  subscribe,
  unsubscribe,
} from '../controllers/notifyMe.controller.js'

const router = express.Router()

router.use(requireAuth)

// GET /api/notify-me — all active subscriptions for user
router.get('/', getSubscriptions)

// GET /api/notify-me/check?targetType=X&targetId=Y
router.get('/check', checkSubscription)

// POST /api/notify-me — subscribe { targetType, targetId }
router.post('/', subscribe)

// DELETE /api/notify-me — unsubscribe { targetType, targetId }
router.delete('/', unsubscribe)

export default router
