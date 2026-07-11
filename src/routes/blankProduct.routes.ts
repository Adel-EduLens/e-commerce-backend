import { Router } from "express";

import {
  createBlankProduct,
  getBlankProducts,
  getBlankProductById,
  updateBlankProduct,
  deleteBlankProduct,
} from "../controllers/blankProduct.controller.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
  createBlankProductSchema,
  updateBlankProductSchema,
} from "../schemas/blankProduct.schema.js";

const router = Router();

// Create Blank Product
router.post(
  "/",
  validateRequest(createBlankProductSchema),
  createBlankProduct,
);

// Get All Blank Products
router.get("/", getBlankProducts);

// Get Blank Product By Id
router.get("/:id", getBlankProductById);

// Update Blank Product
router.patch(
  "/:id",
  validateRequest(updateBlankProductSchema),
  updateBlankProduct,
);

// Delete Blank Product
router.delete("/:id", deleteBlankProduct);

export default router;
