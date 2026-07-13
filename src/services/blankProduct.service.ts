import AppError from "../utils/AppError.util.js";

import { blankProductRepository } from "../repositories/blankProduct.repository.js";
import type {
  CreateBlankProductInput,
  UpdateBlankProductInput,
} from "../types/blankProduct.type.js";
export const blankProductService = {
  async create(data: CreateBlankProductInput) {
    return blankProductRepository.create(data);
  },

  async getAll() {
    return blankProductRepository.findAll();
  },

  async getOne(id: string) {
    const blankProduct = await blankProductRepository.findById(id);

    if (!blankProduct) {
      throw new AppError("Blank product not found", 404);
    }

    return blankProduct;
  },

  async update(id: string, data: UpdateBlankProductInput) {
    const blankProduct = await blankProductRepository.findById(id);

    if (!blankProduct) {
      throw new AppError("Blank product not found", 404);
    }

    return blankProductRepository.update(id, data);
  },

  async delete(id: string) {
    const blankProduct = await blankProductRepository.findById(id);

    if (!blankProduct) {
      throw new AppError("Blank product not found", 404);
    }

    return blankProductRepository.delete(id);
  },
};
