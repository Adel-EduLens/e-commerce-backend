import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware.js'
import { getVideosByCategory, getHelpCenterCategories } from '../controllers/user.controller.js'
const userRouter = Router()

userRouter.get('/help-center/categories', requireAuth, getHelpCenterCategories)
userRouter.get('/help-center/:category', requireAuth, getVideosByCategory)

export default userRouter
