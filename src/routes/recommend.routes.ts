import { Router } from 'express'
import {
  addSignal,
  getSignals,
  getTopCategories,
  clearSignals,
} from '../controllers/recommend.controller.js'
import { requireAuth } from '../middlewares/auth.middleware.js'

const recommendRouter = Router()

recommendRouter.use(requireAuth)

recommendRouter.post('/', addSignal)
recommendRouter.get('/', getSignals)
recommendRouter.get('/top-categories', getTopCategories)
recommendRouter.delete('/', clearSignals)

export default recommendRouter
