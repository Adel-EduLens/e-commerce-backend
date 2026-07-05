import { Router } from "express";

import {
  createWholesale,
  getWholesales,
  getTraderWholesales,
  getWholesale,
  updateWholesale,
  deleteWholesale,
} from "../controllers/wholesale.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createWholesaleSchema,
  updateWholesaleSchema,
} from "../schemas/wholesale.schema.js";
import { requireRole, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  validateRequest(createWholesaleSchema),
  requireAuth,
  requireRole("trader"),
  createWholesale,
);

router.get("/", getWholesales);

router.get(
  "/trader",
  requireAuth,
  requireRole("trader"),
  getTraderWholesales,
);

router.get("/:id", getWholesale);

router.patch(
  "/:id",
  validateRequest(updateWholesaleSchema),
  requireAuth,
  requireRole("trader"),
  updateWholesale,
);

router.delete("/:id", requireAuth, requireRole("trader"), deleteWholesale);

export default router;
