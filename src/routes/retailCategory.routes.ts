import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/retailCategory.controller.js";
import {
  createRetailCategorySchema,
  updateRetailCategorySchema,
} from "../schemas/retail.schema.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ===== Retail Categories =====
router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById);
router.post(
  "/categories",
  requireAuth,
  requireRole("trader"),
  validateRequest(createRetailCategorySchema),
  createCategory,
);
router.put(
  "/categories/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateRetailCategorySchema),
  updateCategory,
);
router.delete(
  "/categories/:id",
  requireAuth,
  requireRole("trader"),
  deleteCategory,
);
export default router