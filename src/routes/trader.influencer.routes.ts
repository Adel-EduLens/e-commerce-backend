import { Router } from "express";
import {
  createInfluencer,
  getAllInfluencers,
  getInfluencerById,
  updateInfluencer,
  updateInfluencerCoupon,
  getInfluencerCommissions,
  getInfluencerSettlements,
  getAllSettlements,
  generateSettlements,
  markSettlementPaid,
} from "../controllers/trader.influencer.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createInfluencerSchema,
  updateInfluencerSchema,
  updateInfluencerCouponSchema,
} from "../schemas/influencer.schema.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("trader"));

router.post("/", validateRequest(createInfluencerSchema), createInfluencer);
router.get("/", getAllInfluencers);

// Settlements
router.get("/settlements", getAllSettlements);
router.post("/settlements/generate", generateSettlements);
router.patch("/settlements/:id/pay", markSettlementPaid);

// Single influencer
router.get("/:id", getInfluencerById);
router.patch("/:id", validateRequest(updateInfluencerSchema), updateInfluencer);
router.patch("/:id/coupon", validateRequest(updateInfluencerCouponSchema), updateInfluencerCoupon);
router.get("/:id/commissions", getInfluencerCommissions);
router.get("/:id/settlements", getInfluencerSettlements);

export default router;
