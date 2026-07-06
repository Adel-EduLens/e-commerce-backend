import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  rateProduct,
} from "../controllers/product.controller.js";
import { validateRequest } from '../middlewares/validation.middleware.js';
import { createProductSchema, updateProductSchema, productRatingSchema } from "../schemas/product.schema.js"
import { requireAuth } from '../middlewares/auth.middleware.js'
const router = Router();
router.post(
  "/",
  validateRequest(createProductSchema),
  createProduct
);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/:id/rating", requireAuth, validateRequest(productRatingSchema), rateProduct);

router.patch(
  "/:id",
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete("/:id", deleteProduct);

export default router;
