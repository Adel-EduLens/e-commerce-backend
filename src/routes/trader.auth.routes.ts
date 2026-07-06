import { Router } from 'express'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { adminLoginSchema } from '../schemas/admin.auth.schema.js'
import { traderLogin } from '../controllers/trader.auth.controller.js'

const traderRouter = Router()

traderRouter.post('/login', validateRequest(adminLoginSchema), traderLogin)

export default traderRouter
