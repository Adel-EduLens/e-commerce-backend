import { Router } from "express";
import {
  // CRUD
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getTraderProducts,
  getRecommendations,
  // Colors
  addProductColor,
  deleteProductColor,
  // Images
  addProductImages,
  replaceColorImages,
  deleteProductImage,
  // Sizes / Variants
  addProductSize,
  updateProductVariant,
  deleteProductVariant,
} from "../controllers/product.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";
import { requireRole, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────

// GET /products?type=SHOP&categoryId=...&brandId=...&priceMin=...&size=...
router.get("/", getProducts);

// GET /products/recommendations?type=WHOLESALE&categories=...
router.get("/recommendations", getRecommendations);

// GET /products/:id
router.get("/:id", getProduct);

// ─── Trader — CRUD ────────────────────────────────────────────────────────

// GET /products/trader?type=RETAIL
router.get("/trader", requireAuth, requireRole("trader"), getTraderProducts);

// POST /products  { productTypes, name, sku, shopPrice, images: [{url, color}], colors: [...], ... }
router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createProductSchema),
  createProduct
);

// PATCH /products/:id
router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateProductSchema),
  updateProduct
);

// DELETE /products/:id            → delete entire product
// DELETE /products/:id?type=SHOP  → remove only SHOP type
router.delete("/:id", requireAuth, requireRole("trader"), deleteProduct);

// ─── Trader — Color Management ────────────────────────────────────────────

// POST /products/:productId/colors
// Body: { color, minOrder?, stock?, images?: [{url, direction?}], sizes?: [{size}] }
router.post(
  "/:productId/colors",
  requireAuth,
  requireRole("trader"),
  addProductColor
);

// DELETE /products/colors/:colorId
router.delete(
  "/colors/:colorId",
  requireAuth,
  requireRole("trader"),
  deleteProductColor
);

// ─── Trader — Image Management ────────────────────────────────────────────

// POST /products/:productId/images
// Body: { images: [{url, color?, direction?, colorId?}] }
router.post(
  "/:productId/images",
  requireAuth,
  requireRole("trader"),
  addProductImages
);

// PUT /products/colors/:colorId/images  (replace all images for a color)
// Body: { images: [{url, direction?}] }
router.put(
  "/colors/:colorId/images",
  requireAuth,
  requireRole("trader"),
  replaceColorImages
);

// DELETE /products/images/:imageId
router.delete(
  "/images/:imageId",
  requireAuth,
  requireRole("trader"),
  deleteProductImage
);

// ─── Trader — Size / Variant Management ──────────────────────────────────

// POST /products/colors/:colorId/sizes
// Body: { size: string, quantity?: number }
router.post(
  "/colors/:colorId/sizes",
  requireAuth,
  requireRole("trader"),
  addProductSize
);

// PATCH /products/variants/:variantId
// Body: { quantity: number }
router.patch(
  "/variants/:variantId",
  requireAuth,
  requireRole("trader"),
  updateProductVariant
);

// DELETE /products/variants/:variantId
router.delete(
  "/variants/:variantId",
  requireAuth,
  requireRole("trader"),
  deleteProductVariant
);

export default router;
