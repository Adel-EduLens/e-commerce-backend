import { Router } from "express";

import {
  createRetailBrand,
  getRetailBrands,
  getRetailBrandById,
  updateRetailBrand,
  deleteRetailBrand,
  getMyRetailBrands,
} from "../controllers/retailBrand.controller.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  createRetailBrandSchema,
  updateRetailBrandSchema,
} from "../schemas/retail.schema.js";

const router = Router();

// public

router.get("/", getRetailBrands);

router.get("/:id", getRetailBrandById);

// trader

router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createRetailBrandSchema),
  createRetailBrand,
);

router.get("/my", requireAuth, requireRole("trader"), getMyRetailBrands);

router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateRetailBrandSchema),
  updateRetailBrand,
);

router.delete("/:id", requireAuth, requireRole("trader"), deleteRetailBrand);

export default router;
