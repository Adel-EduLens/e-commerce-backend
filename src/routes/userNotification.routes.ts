import express from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from '../controllers/userNotification.controller.js'

const router = express.Router()

// All routes require authentication
router.use(requireAuth, requireRole('user'))

// Get all notifications for the authenticated user
router.get('/', getNotifications)

// Get unread count
router.get('/unread-count', getUnreadCount)

// Mark a notification as read
router.patch('/:id/read', markRead)

// Mark all as read
router.patch('/read-all', markAllRead)

// Delete a notification
router.delete('/:id', deleteNotification)

export default router
