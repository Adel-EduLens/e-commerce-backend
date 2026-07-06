import AppError from "../utils/AppError.util.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { wholesaleRepository } from "../repositories/wholesale.repository.js";
import { WholesaleCreateData, WholesaleUpdateData } from "../types/wholesale.types.js";
import { traderProfileRepository } from "../repositories/traderProfile.repository.js";

export const wholesaleService = {
  async create(data: WholesaleCreateData) {
    const trader = await traderProfileRepository.findById(data.traderId);
    if (!trader) {
      throw new AppError("Trader not found", 404);
    }

    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return wholesaleRepository.create({ ...data });
  },

  async getAll(query: { search?: string | undefined; categoryId?: string | undefined; categoryName?: string | undefined; isBestDeal?: boolean | undefined; isMostPopular?: boolean | undefined; isPremiumCollection?: boolean | undefined }) {
    return wholesaleRepository.findAll(query);
  },

  async getByTraderId(traderId: number) {
    return wholesaleRepository.findByTraderId(traderId);
  },

  async getById(id: string) {
    const wholesale = await wholesaleRepository.findById(id);
    if (!wholesale) {
      throw new AppError("Wholesale product not found", 404);
    }
    return wholesale;
  },

  async update(id: string, data: WholesaleUpdateData) {
    const wholesale = await this.getById(id);

    if (data.traderId !== wholesale.traderId) {
      throw new AppError("You are not authorized to update this wholesale product", 403);
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    return wholesaleRepository.update(id, data);
  },

  async delete(id: string, traderId: number) {
    const wholesale = await this.getById(id);
    if (traderId !== wholesale.traderId) {
      throw new AppError("You are not authorized to delete this wholesale product", 403);
    }
    return wholesaleRepository.delete(id);
  },
};
