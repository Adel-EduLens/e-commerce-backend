import { Router } from 'express'
import {
  getHelpIndex,
  getHelpCategories,
  getHelpFaqs,
  getHelpFaqById,
} from '../controllers/help.controller.js'

const router = Router()

router.get('/', getHelpIndex)
router.get('/categories', getHelpCategories)
router.get('/faqs', getHelpFaqs)
router.get('/faqs/:id', getHelpFaqById)

export default router
