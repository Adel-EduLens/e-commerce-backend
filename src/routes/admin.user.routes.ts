import { Router } from 'express'
import {
  getAllUsers,
  changeStatus,
} from '../controllers/admin.user.controller.js'
import { requireAdminAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { changeStatusSchema } from '../schemas/admin.auth.schema.js'

const router = Router()

router.get('/', requireAdminAuth, getAllUsers)

router.put(
  '/:id/status',
  requireAdminAuth,
  validateRequest(changeStatusSchema),
  changeStatus
)

export default router
