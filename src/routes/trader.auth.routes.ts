import { Router } from 'express'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { adminLoginSchema } from '../schemas/admin.auth.schema.js'
import { traderLogin, getTraderMe, updateTraderMe } from '../controllers/trader.auth.controller.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'

const traderRouter = Router()

traderRouter.post('/login', validateRequest(adminLoginSchema), traderLogin)
traderRouter.get('/me', requireAuth, requireRole('trader'), getTraderMe)
traderRouter.patch('/me', requireAuth, requireRole('trader'), updateTraderMe)

export default traderRouter
