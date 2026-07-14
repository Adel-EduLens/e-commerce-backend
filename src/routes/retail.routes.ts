import express from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getTraderProducts,
  getRecommendations,
} from "../controllers/retailProduct.controller.js";


import {
  getUserNotifications,
  createNotification,
  deleteNotification,
  deleteNotificationByProduct,
} from "../controllers/retailNotifyMe.controller.js";

import {
  requireAuth,
  optionalAuth,
  requireRole,
} from "../middlewares/auth.middleware.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
  createRetailProductSchema,
  updateRetailProductSchema,
  createRetailNotifyMeSchema,
} from "../schemas/retail.schema.js";


const router = express.Router();


// ================= Retail Products =================

router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createRetailProductSchema),
  createProduct,
);


router.get(
  "/products/recommendations",
  getRecommendations
);

router.get(
  "/",
  getProducts
);

router.get(
  "/:id",
  getProduct
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateRetailProductSchema),
  updateProduct,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("trader"),
  deleteProduct,
);

// ================= Notify Me =================

router.get(
  "/notify-me/user/:userId",
  getUserNotifications
);


router.post(
  "/notify-me",
  requireAuth,
  requireRole("user"),
  validateRequest(createRetailNotifyMeSchema),
  createNotification,
);


router.delete(
  "/notify-me/:id",
  requireAuth,
  requireRole("user"),
  deleteNotification,
);


router.delete(
  "/notify-me/user/:userId/product/:retailProductId",
  requireAuth,
  requireRole("user"),
  deleteNotificationByProduct,
);


export default router;