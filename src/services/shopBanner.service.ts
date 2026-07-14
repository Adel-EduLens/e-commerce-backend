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
  type?: string;
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
  type?: string;
}

export const shopBannerService = {
  async create(data: CreateBannerData) {
    return shopBannerRepository.create(data);
  },

  async getAll(type?: string) {
    return shopBannerRepository.findAll(type);
  },

  async getActive(type?: string) {
    return shopBannerRepository.findActive(type);
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
