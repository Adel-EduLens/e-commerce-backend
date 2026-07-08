import { Router } from 'express'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import {
  getNotifications, markRead, markAllRead,
} from '../controllers/notification.controller.js'

const notificationRouter = Router()

notificationRouter.use(requireAuth, requireRole('user'))

notificationRouter.get('/', getNotifications)
notificationRouter.patch('/read-all', markAllRead)
notificationRouter.patch('/:id/read', markRead)

export default notificationRouter
