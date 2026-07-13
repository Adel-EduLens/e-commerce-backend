import { Router } from "express";
import {
  createHomeBanner,
  getHomeBanners,
  getHomeBanner,
  updateHomeBanner,
  deleteHomeBanner,
} from "../controllers/homeBanner.controller.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  createHomeBannerSchema,
  updateHomeBannerSchema,
} from "../schemas/homeBanner.schema.js";

const router = Router();

router.get("/", getHomeBanners);
router.post("/", validateRequest(createHomeBannerSchema), createHomeBanner);
router.get("/:id", getHomeBanner);
router.patch("/:id", validateRequest(updateHomeBannerSchema), updateHomeBanner);
router.delete("/:id", deleteHomeBanner);

export default router;
