import { retailBrandRepository } from "../repositories/retailBrand.repository.js";

class RetailBrandService {
  async create(name: string) {
    const exists = await retailBrandRepository.findByName(name);

    if (exists) {
      throw new Error("Brand already exists");
    }

    return retailBrandRepository.create({
      name,
    });
  }

  async getAll() {
    return retailBrandRepository.findAll();
  }

  async getById(id: string) {
    const brand = await retailBrandRepository.findById(id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    return brand;
  }

  async update(id: string, name: string) {
    const brand = await retailBrandRepository.findById(id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    const exists = await retailBrandRepository.findByName(name);

    if (exists && exists.id !== id) {
      throw new Error("Brand already exists");
    }

    return retailBrandRepository.update(id, {
      name,
    });
  }

  async delete(id: string) {
    const brand = await retailBrandRepository.findById(id);

    if (!brand) {
      throw new Error("Brand not found");
    }

    return retailBrandRepository.delete(id);
  }

  async getTraderBrands(traderId: number) {
    return retailBrandRepository.findTraderBrands(traderId);
  }
}

export const retailBrandService = new RetailBrandService();
