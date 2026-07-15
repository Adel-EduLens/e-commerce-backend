import { Router } from 'express'
import {
  addVideo,
  deleteVideo,
  getVideos,
  updateVideo,
  addHelpCenterCategory,
  getHelpCenterCategories,
  deleteHelpCenterCategory,
} from '../controllers/video.controller.js'
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { videoSchema, helpCenterCategorySchema } from '../schemas/admin.auth.schema.js'

const traderHelpCenterRouter = Router()

traderHelpCenterRouter.use(requireAuth, requireRole('trader'))

traderHelpCenterRouter.post(
  '/video',
  validateRequest(videoSchema),
  addVideo
)
traderHelpCenterRouter.get('/video', getVideos)
traderHelpCenterRouter.put(
  '/video/:id',
  validateRequest(videoSchema),
  updateVideo
)
traderHelpCenterRouter.delete('/video/:id', deleteVideo)

traderHelpCenterRouter.post(
  '/category',
  validateRequest(helpCenterCategorySchema),
  addHelpCenterCategory
)
traderHelpCenterRouter.get('/category', getHelpCenterCategories)
traderHelpCenterRouter.delete('/category/:id', deleteHelpCenterCategory)

export default traderHelpCenterRouter
