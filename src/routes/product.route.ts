import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getTraderProducts,
  getRecommendations,
} from "../controllers/product.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
import { requireRole, requireAuth } from "../middlewares/auth.middleware.js";
const router = Router();
router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createProductSchema),
  createProduct,
);


router.get("/trader", requireAuth, requireRole("trader"), getTraderProducts);
router.get("/recommendations", getRecommendations);
router.get("/", getProducts);
router.get("/:id", getProduct);

router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateProductSchema),
  updateProduct,
);

router.delete("/:id", requireAuth, requireRole("trader"), deleteProduct);

export default router;
