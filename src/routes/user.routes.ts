import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware.js'
import { getVideosByCategory } from '../controllers/user.controller.js'
const userRouter = Router()

userRouter.get('/help-center/:category', requireAuth, getVideosByCategory)

export default userRouter
