import { Router } from 'express'
import {
  addQuestion,
  adminLogin,
  deleteQuestion,
  getAdminMe,
  getPublicQuestions,
  getQuestions,
  updateQuestion,
} from '../controllers/admin.auth.controller.js'
import { requireAdminAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import {
  addQuestionSchema,
  adminLoginSchema,
} from '../schemas/admin.auth.schema.js'

const router = Router()

router.post('/login', validateRequest(adminLoginSchema), adminLogin)
router.get('/me', requireAdminAuth, getAdminMe)
router.get('/questions/public', getPublicQuestions)
router.get('/questions', requireAdminAuth, getQuestions)
router.post(
  '/questions',
  requireAdminAuth,
  validateRequest(addQuestionSchema),
  addQuestion
)
router.delete('/questions/:id', requireAdminAuth, deleteQuestion)
router.put(
  '/questions/:id',
  requireAdminAuth,
  validateRequest(addQuestionSchema),
  updateQuestion
)

export default router
