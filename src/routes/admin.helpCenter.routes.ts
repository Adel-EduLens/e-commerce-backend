import { Router } from 'express'
import {
  addVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from '../controllers/admin.video.controller.js'
import { requireAdminAuth } from '../middlewares/auth.middleware.js'
import { validateRequest } from '../middlewares/validation.middleware.js'
import { videoSchema } from '../schemas/admin.auth.schema.js'

const helpCenterRouter = Router()

helpCenterRouter.post(
  '/video',
  requireAdminAuth,
  validateRequest(videoSchema),
  addVideo
)
helpCenterRouter.get('/video', requireAdminAuth, getVideos)
helpCenterRouter.put(
  '/video/:id',
  requireAdminAuth,
  validateRequest(videoSchema),
  updateVideo
)
helpCenterRouter.delete('/video/:id', requireAdminAuth, deleteVideo)

export default helpCenterRouter
