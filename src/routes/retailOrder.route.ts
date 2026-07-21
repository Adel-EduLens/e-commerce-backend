import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { createRetailOrderSchema } from "../schemas/retailOrder.schema.js";
import {
  createRetailOrder,
  getMyRetailOrders,
  getRetailOrderById,
  payDeposit,
  getAllRetailOrders,
  verifyId,
  updateStatus,
} from "../controllers/retailOrder.controller.js";

const router = Router();

// Create retail order (user)
router.post(
  "/",
  requireAuth,
  requireRole("user"),
  validateRequest(createRetailOrderSchema),
  createRetailOrder
);

// Get my orders (user)
router.get("/my", requireAuth, requireRole("user"), getMyRetailOrders);

// Get order by id (user)
router.get("/:id", requireAuth, requireRole("user"), getRetailOrderById);

// Pay deposit
router.post("/:id/pay", requireAuth, requireRole("user"), payDeposit);

// Admin routes
router.get("/", requireAuth, requireRole("trader"), getAllRetailOrders);
router.post("/:id/verify-id", requireAuth, requireRole("trader"), verifyId);
router.patch("/:id/status", requireAuth, requireRole("trader"), updateStatus);

export default router;
