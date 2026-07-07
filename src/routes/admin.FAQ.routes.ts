import { Router } from 'express'
import {
  addQuestion,
  deleteQuestion,
  getPublicQuestions,
  getQuestions,
  updateQuestion,
} from '../controllers/admin.faq.controller.js'
import { requireAdminAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { addQuestionSchema } from '../schemas/admin.auth.schema.js'

const FAQRouter = Router()

FAQRouter.get('/questions/public', getPublicQuestions)
FAQRouter.get('/questions', requireAdminAuth, getQuestions)
FAQRouter.post(
  '/questions',
  requireAdminAuth,
  validateRequest(addQuestionSchema),
  addQuestion
)
FAQRouter.delete('/questions/:id', requireAdminAuth, deleteQuestion)
FAQRouter.put(
  '/questions/:id',
  requireAdminAuth,
  validateRequest(addQuestionSchema),
  updateQuestion
)



export default FAQRouter
