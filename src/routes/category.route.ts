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

router.get("/", getCategories);
router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createCategorySchema),
  createCategory,
);
router.get("/:id", getCategory);
router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateCategorySchema),
  updateCategory,
);
router.delete("/:id", requireAuth, requireRole("trader"), deleteCategory);

export default router;
