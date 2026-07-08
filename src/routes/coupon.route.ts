import { Router } from "express";
import {
  createCoupon,
  getCoupons,
  getCoupon,
  getCouponByCode,
  useCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../schemas/coupon.schema.js";
import { requireRole, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Validate coupon by its code (e.g. at checkout)
router.get("/validate/:code", requireAuth, getCouponByCode);

// Use/increment usage count of a coupon (e.g. at checkout completion)
router.post("/use/:code", requireAuth, useCoupon);

// Protected routes
router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createCouponSchema),
  createCoupon
);

router.get("/", requireAuth, getCoupons);
router.get("/:id", requireAuth, getCoupon);

router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateCouponSchema),
  updateCoupon
);

router.delete("/:id", requireAuth, requireRole("trader"), deleteCoupon);

export default router;
