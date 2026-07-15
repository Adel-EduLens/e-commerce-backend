import express from "express";

import {
  createRetailOrder,
  getMyRetailOrders,
  getRetailOrderById,
  payDeposit,
  getAllRetailOrders,
  verifyId,
  updateStatus,
} from "../controllers/retailOrder.controller.js";

import {
  createRetailOrderSchema,
  payDepositSchema,
  updateRetailOrderStatusSchema,
} from "../schemas/retailOrder.schema.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
  requireAuth,
  requireRole,
  requireAdminAuth,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// ================= USER =================

router.post(
  "/",
  requireAuth,
  requireRole("user"),
  validateRequest(createRetailOrderSchema),
  createRetailOrder,
);

router.get("/my-orders", requireAuth, requireRole("user"), getMyRetailOrders);

router.get("/:id", requireAuth, requireRole("user"), getRetailOrderById);

//webHook use this route so no middleware auth
router.post("/:id/pay-deposit", validateRequest(payDepositSchema), payDeposit);

// ================= ADMIN =================

router.get("/trader/all", requireAuth, requireRole("trader"), getAllRetailOrders);

router.patch("/trader/:id/verify-id", requireAuth, requireRole("trader"), verifyId);

router.patch(
  "/trader/:id/status",
  requireAuth, requireRole("trader"),
  validateRequest(updateRetailOrderStatusSchema),
  updateStatus,
);

export default router;
