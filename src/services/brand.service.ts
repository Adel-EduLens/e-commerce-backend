import AppError from "../utils/AppError.util.js";
import { brandRepository } from "../repositories/brand.repository.js";
import type { CreateBrandData } from "../types/brand.type.js";
export const brandService = {
  async getAll() {
    const brands = await brandRepository.findAll();
    return brands;
  },
  async create(data: CreateBrandData) {
    const exists = await brandRepository.findByName(data.name);
    if (exists) {
      throw new AppError("Brand already exists", 400);
    }
    return brandRepository.create(data);
  },
};
