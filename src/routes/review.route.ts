import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews
} from "../controllers/review.controller.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema.js";

const router = Router();

// Create review
router.post(
  "/",
  requireAuth,
  requireRole("user"),
  validateRequest(createReviewSchema),
  createReview,
);

// Update review
router.patch(
  "/:id",
  requireAuth,
  requireRole("user"),
  validateRequest(updateReviewSchema),
  updateReview,
);

// Delete review
router.delete("/:id", requireAuth, requireRole("user"), deleteReview);

// Get reviews for a product
router.get("/product/:productId",getProductReviews);

export default router;
