import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { validateRequest } from '../middlewares/validation.middleware.js';
import {createProductSchema, updateProductSchema} from "../schemas/product.schema.js"
const router = Router();
router.post(
  "/",
  validateRequest(createProductSchema),
  createProduct
);

router.get("/", getProducts);
router.get("/:id", getProduct);

router.patch(
  "/:id",
  validateRequest(updateProductSchema),
  updateProduct
);

router.delete("/:id", deleteProduct);

export default router;
