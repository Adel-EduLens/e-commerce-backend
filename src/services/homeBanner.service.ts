import { homeBannerRepository } from "../repositories/homeBanner.repository.js";
import AppError from "../utils/AppError.util.js";

interface CreateBannerData {
  title: string;
  image: string;
  order?: number;
}

interface UpdateBannerData {
  title?: string;
  image?: string;
  order?: number;
}

export const homeBannerService = {
  async create(data: CreateBannerData) {
    return homeBannerRepository.create(data);
  },

  async getAll() {
    return homeBannerRepository.findAll();
  },

  async getById(id: number) {
    const banner = await homeBannerRepository.findById(id);

    if (!banner) {
      throw new AppError("Home banner not found", 404);
    }

    return banner;
  },

  async update(id: number, data: UpdateBannerData) {
    await this.getById(id);
    return homeBannerRepository.update(id, data);
  },

  async delete(id: number) {
    await this.getById(id);
    return homeBannerRepository.delete(id);
  },
};
