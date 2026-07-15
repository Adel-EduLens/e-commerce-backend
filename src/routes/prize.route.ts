import { Router } from "express";
import {
  getPrizes,
  addPrize,
  deletePrize,
  spinPrize,
} from "../controllers/prize.controller.js";
import { requireRole, requireAuth } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createPrizeSchema,
} from "../schemas/prize.schema.js";
const router = Router();

router
  .get("/", requireAuth,requireRole("trader"), getPrizes)
  .post("/", requireAuth,requireRole("trader"), validateRequest(createPrizeSchema), addPrize)
  .post("/spin", requireAuth, requireRole("user"), spinPrize)
  .delete("/:id", requireAuth,requireRole("trader"), deletePrize);

export default router;
