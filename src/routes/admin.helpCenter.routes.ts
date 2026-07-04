import { Router } from 'express'
import {
  addVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from '../controllers/admin.auth.controller.js'
import { requireAdminAuth } from '../middlewares/auth.middleware.js'

const helpCenterRouter = Router()

helpCenterRouter.post('/video', requireAdminAuth, addVideo)
helpCenterRouter.get('/video', requireAdminAuth, getVideos)
helpCenterRouter.put('/video/:id', requireAdminAuth, updateVideo)
helpCenterRouter.delete('/video/:id', requireAdminAuth, deleteVideo)

export default helpCenterRouter
