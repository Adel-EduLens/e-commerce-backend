import { Router } from "express";
import {
  getInfluencerDashboard,
  getInfluencerCouponUsers,
  getInfluencerCommissions,
  getInfluencerSettlements,
} from "../controllers/influencer.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("influencer"));

router.get("/dashboard", getInfluencerDashboard);
router.get("/coupon-users", getInfluencerCouponUsers);
router.get("/commissions", getInfluencerCommissions);
router.get("/settlements", getInfluencerSettlements);

export default router;
