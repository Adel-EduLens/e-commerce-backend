import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getFilters,
  getTraderProducts,
  getProductRecommendations,
  getProductReviewsPage,
} from "../controllers/product.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
import { requireRole, requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";
const router = Router();
router.post(
  "/",
  validateRequest(createProductSchema),
  requireAuth,
  requireRole("trader"),
  createProduct,
);

router.get("/filters", getFilters);
router.get("/trader", requireAuth, requireRole("trader"), getTraderProducts);
router.get("/", getProducts);
router.get("/:id", optionalAuth, getProduct);
router.get("/:id/recommended", getProductRecommendations);
router.get("/:id/reviews", getProductReviewsPage);

router.patch(
  "/:id",
  validateRequest(updateProductSchema),
  requireAuth,
  requireRole("trader"),
  updateProduct,
);

router.delete("/:id", requireAuth, requireRole("trader"), deleteProduct);

export default router;
