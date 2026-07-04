import { Router } from 'express'
import {
  getDashboard,
  getMe,
  updateMe,
  signOut,
} from '../controllers/account.controller.js'
import {
  getOrders,
  getOrderById,
  cancelOrder,
} from '../controllers/order.controller.js'
import {
  getWallet,
  getWalletTransactions,
  redeemPoints,
} from '../controllers/wallet.controller.js'
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js'
import {
  getNotifyMeItems,
  createNotifyMeItem,
  deleteNotifyMeItem,
} from '../controllers/notifyMe.controller.js'
import {
  getSettings,
  updateSettings,
} from '../controllers/userSettings.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import {
  createNotifyMeSchema,
  redeemSchema,
  updateProfileSchema,
  updateSettingsSchema,
} from '../schemas/account.schema.js'

const router = Router()

router.get('/dashboard', requireAuth, getDashboard)
router.get('/orders', requireAuth, getOrders)
router.get('/orders/:orderId', requireAuth, getOrderById)
router.patch('/orders/:orderId/cancel', requireAuth, cancelOrder)

router.get('/wallet', requireAuth, getWallet)
router.get('/wallet/transactions', requireAuth, getWalletTransactions)
router.post('/wallet/redeem', requireAuth, validateRequest(redeemSchema), redeemPoints)

router.get('/me', requireAuth, getMe)
router.patch('/me', requireAuth, validateRequest(updateProfileSchema), updateMe)

router.get('/notifications', requireAuth, getNotifications)
router.get('/notifications/unread-count', requireAuth, getUnreadNotificationsCount)
router.patch('/notifications/:notificationId/read', requireAuth, markNotificationAsRead)
router.patch('/notifications/read-all', requireAuth, markAllNotificationsAsRead)
router.delete('/notifications/:notificationId', requireAuth, deleteNotification)

router.get('/notify-me', requireAuth, getNotifyMeItems)
router.post('/notify-me', requireAuth, validateRequest(createNotifyMeSchema), createNotifyMeItem)
router.delete('/notify-me/:id', requireAuth, deleteNotifyMeItem)

router.get('/settings', requireAuth, getSettings)
router.patch('/settings', requireAuth, validateRequest(updateSettingsSchema), updateSettings)

router.post('/sign-out', requireAuth, signOut)

export default router
