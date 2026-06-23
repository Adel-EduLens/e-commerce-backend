import { Router } from 'express';
import { signup, login, getMe } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { signupSchema, loginSchema } from '../schemas/auth.schema.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', requireAuth, getMe);

export default router;
