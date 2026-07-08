import { Router } from "express";

import {
  addAddress,
  deleteAddress,
  getMyAddresses,
  updateAddress,
} from "../controllers/address.controller.js";

import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
  addAddressSchema,
  updateAddressSchema,
} from "../schemas/address.schema.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("user"),
  validateRequest(addAddressSchema),
  addAddress,
);

router.get("/my", requireAuth, requireRole("user"), getMyAddresses);

router.patch(
  "/:id",
  requireAuth,
  requireRole("user"),
  validateRequest(updateAddressSchema),
  updateAddress,
);

router.delete("/:id", requireAuth, requireRole("user"), deleteAddress);

export default router;
