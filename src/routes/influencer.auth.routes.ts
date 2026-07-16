import { Router } from "express";
import { influencerLogin, getInfluencerMe } from "../controllers/influencer.auth.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { influencerLoginSchema } from "../schemas/influencer.schema.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", validateRequest(influencerLoginSchema), influencerLogin);
router.get("/me", requireAuth, requireRole("influencer"), getInfluencerMe);

export default router;
