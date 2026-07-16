import { Router } from 'express'
import {
  addFAQ,
  deleteFAQ,
  getPublicFAQs,
  getFAQs,
  updateFAQ,
} from '../controllers/trader.faq.controller.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { addQuestionSchema } from '../schemas/faq.schema.js'

const traderFAQRouter = Router()

traderFAQRouter.get('/questions/public', getPublicFAQs)

// Authenticated trader routes
traderFAQRouter.use(requireAuth, requireRole('trader'))

traderFAQRouter.get('/questions', getFAQs)
traderFAQRouter.post(
  '/questions',
  validateRequest(addQuestionSchema),
  addFAQ
)
traderFAQRouter.delete('/questions/:id', deleteFAQ)
traderFAQRouter.put(
  '/questions/:id',
  validateRequest(addQuestionSchema),
  updateFAQ
)

export default traderFAQRouter
