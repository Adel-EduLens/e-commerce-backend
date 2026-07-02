import { Router } from "express";
import {
  getPrizes,
  addPrize,
  deletePrize,
  spinPrize,
} from "../controllers/przie.controller.js";
import { requireAdminAuth } from "../middlewares/auth.middleware.js";
const router = Router();

router
  .get("/", getPrizes)
  // .post("/", requireAdminAuth, addPrize)
  .post("/", addPrize)
  .post("/spin", spinPrize)
  // .delete("/:id", requireAdminAuth, deletePrize)
  .delete("/:id", deletePrize);

export default router;
