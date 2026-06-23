import { Router } from 'express';
import { adminLogin, getAdminMe } from '../controllers/admin.auth.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { adminLoginSchema } from '../schemas/admin.auth.schema.js';
import { requireAdminAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', validateRequest(adminLoginSchema), adminLogin);
router.get('/me', requireAdminAuth, getAdminMe);

export default router;
