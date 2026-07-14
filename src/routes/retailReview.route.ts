import { Router } from "express";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
  createRetailReview,
  updateRetailReview,
  deleteRetailReview,
  getRetailProductReviews,
} from "../controllers/retailReview.controller.js";

import {
  createRetailReviewSchema,
  updateRetailReviewSchema,
} from "../schemas/retail.schema.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("user"),
  validateRequest(createRetailReviewSchema),
  createRetailReview,
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("user"),
  validateRequest(updateRetailReviewSchema),
  updateRetailReview,
);

router.delete("/:id", requireAuth, requireRole("user"), deleteRetailReview);

router.get("/product/:productId", getRetailProductReviews);

export default router;
