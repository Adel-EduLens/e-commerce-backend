import { Router } from "express";
import {
  createCollection,
  deleteCollection,
  getCollections,
  getCollection,
  updateCollection,
} from "../controllers/collection.controller.js";

import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "../schemas/collection.schema.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getCollections);
router.post(
  "/",
  requireAuth,
  requireRole("trader"),
  validateRequest(createCollectionSchema),
  createCollection,
);
router.get("/:id", getCollection);
router.patch(
  "/:id",
  requireAuth,
  requireRole("trader"),
  validateRequest(updateCollectionSchema),
  updateCollection,
);
router.delete("/:id", requireAuth, requireRole("trader"), deleteCollection);

export default router;
