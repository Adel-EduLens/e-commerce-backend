import { shopBannerRepository } from "../repositories/shopBanner.repository.js";
import AppError from "../utils/AppError.util.js";

interface CreateBannerData {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  image: string;
  backgroundColor?: string;
  isActive?: boolean;
  order?: number;
}

interface UpdateBannerData {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  backgroundColor?: string;
  isActive?: boolean;
  order?: number;
}

export const shopBannerService = {
  async create(data: CreateBannerData) {
    return shopBannerRepository.create(data);
  },

  async getAll() {
    return shopBannerRepository.findAll();
  },

  async getActive() {
    return shopBannerRepository.findActive();
  },

  async getById(id: string) {
    const banner = await shopBannerRepository.findById(id);

    if (!banner) {
      throw new AppError("Shop banner not found", 404);
    }

    return banner;
  },

  async update(id: string, data: UpdateBannerData) {
    await this.getById(id);

    return shopBannerRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);

    return shopBannerRepository.delete(id);
  },
};
