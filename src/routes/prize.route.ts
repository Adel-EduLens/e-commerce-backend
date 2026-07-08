import { Router } from "express";
import {
  getPrizes,
  addPrize,
  deletePrize,
  spinPrize,
} from "../controllers/prize.controller.js";
import { requireAdminAuth } from "../middlewares/auth.middleware.js";
import { requireRole, requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createPrizeSchema,
} from "../schemas/prize.schema.js";
const router = Router();

router
  .get("/", requireAdminAuth, getPrizes)
  .post("/", requireAdminAuth, validateRequest(createPrizeSchema), addPrize)
  .post("/spin", requireAuth, requireRole("user"), spinPrize)
  .delete("/:id", requireAdminAuth, deletePrize);

export default router;
