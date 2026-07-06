import { Router } from "express";
import { getBrands, createBrand } from "../controllers/brand.controller.js";
import { validateRequest } from '../middlewares/validation.middleware.js';
import { createBrandSchema } from '../schemas/brand.schema.js';
const router = Router();

router.get("/", getBrands);
router.post("/", validateRequest(createBrandSchema), createBrand);

export default router;
