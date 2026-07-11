import { Router } from "express";

import {
  createShopBanner,
  deleteShopBanner,
  getShopBanner,
  getShopBanners,
  getActiveShopBanners,
  updateShopBanner,
} from "../controllers/shopBanner.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
  createShopBannerSchema,
  updateShopBannerSchema,
} from "../schemas/shopBanner.schema.js";

const router = Router();

router.get("/", getShopBanners);

router.get("/active", getActiveShopBanners);

router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createShopBannerSchema),
  createShopBanner,
);

router.get("/:id", getShopBanner);

router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateShopBannerSchema),
  updateShopBanner,
);

router.delete("/:id", requireAuth, requireRole("trader"), deleteShopBanner);

export default router;
