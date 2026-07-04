import { Router } from "express";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    updateCategory,
} from "../controllers/category.controller.js";

import { validateRequest } from '../middlewares/validation.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema.js';
const router = Router();

router.get("/", getCategories);
router.post(
    "/",
    validateRequest(createCategorySchema),
    createCategory
);
router.get("/:id", getCategory);
router.patch(
    "/:id",
    validateRequest(updateCategorySchema),
    updateCategory
);
router.delete("/:id", deleteCategory);

export default router;