import { Request, Response } from "express";
import { asyncHandler } from "../utils/globalErrorHandler.util.js";
import { shopBannerRepository } from "../repositories/shopBanner.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { brandRepository } from "../repositories/brand.repository.js";
import { adminRepository } from "../repositories/admin.repository.js";

export const getHomeData = asyncHandler(async (req: Request, res: Response) => {
  const [banners, categories, brands, faqs] = await Promise.all([
    shopBannerRepository.findActive(),
    categoryRepository.findAll(),
    brandRepository.findAll(),
    adminRepository.getQuestions(),
  ]);

  res.status(200).json({
    banners,
    categories,
    brands,
    faqs,
  });
});
