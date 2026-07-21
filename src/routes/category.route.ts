import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// GET /categories?isWholesale=true&isRetail=true&isShop=true
router.get("/", getCategories);

// POST /categories
router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createCategorySchema),
  createCategory
);

// GET /categories/:id
router.get("/:id", getCategory);

// PATCH /categories/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateCategorySchema),
  updateCategory
);

// DELETE /categories/:id  (blocked if category has products)
router.delete("/:id", requireAuth, requireRole("trader"), deleteCategory);

export default router;
