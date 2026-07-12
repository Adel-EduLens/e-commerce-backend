import { Router } from "express";
import { getBrands, createBrand } from "../controllers/brand.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from '../middlewares/validation.middleware.js';
import { createBrandSchema } from '../schemas/brand.schema.js';
const router = Router();

router.get("/", getBrands);
router.post("/", requireAuth, requireRole("trader"), validateRequest(createBrandSchema), createBrand);

export default router;
