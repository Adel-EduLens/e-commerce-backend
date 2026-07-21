import AppError from "../utils/AppError.util.js";
import { shippingRepository } from "../repositories/shipping.repository.js";
import type {
  CreateShippingCountryInput,
  UpdateShippingCountryInput,
  CreateShippingCityInput,
  UpdateShippingCityInput,
} from "../types/shipping.type.js";

export const shippingService = {
  // --- Country Operations ---

  async createCountry(data: CreateShippingCountryInput) {
    const existing = await shippingRepository.findCountryByName(data.name);
    if (existing) {
      throw new AppError("Country with this name already exists", 400);
    }
    return shippingRepository.createCountry(data);
  },

  async getAllCountries() {
    return shippingRepository.findAllCountries();
  },

  async getCountryById(id: string) {
    const country = await shippingRepository.findCountryById(id);
    if (!country) {
      throw new AppError("Shipping country not found", 404);
    }
    return country;
  },

  async updateCountry(id: string, data: UpdateShippingCountryInput) {
    const country = await shippingRepository.findCountryById(id);
    if (!country) {
      throw new AppError("Shipping country not found", 404);
    }

    if (data.name && data.name !== country.name) {
      const existing = await shippingRepository.findCountryByName(data.name);
      if (existing) {
        throw new AppError("Country with this name already exists", 400);
      }
    }

    return shippingRepository.updateCountry(id, data);
  },

  async deleteCountry(id: string) {
    const country = await shippingRepository.findCountryById(id);
    if (!country) {
      throw new AppError("Shipping country not found", 404);
    }
    return shippingRepository.deleteCountry(id);
  },

  // --- City Operations ---

  async createCity(data: CreateShippingCityInput) {
    const country = await shippingRepository.findCountryById(data.countryId);
    if (!country) {
      throw new AppError("Shipping country not found", 404);
    }

    const existing = await shippingRepository.findCityByNameAndCountry(
      data.name,
      data.countryId
    );
    if (existing) {
      throw new AppError("City with this name already exists in this country", 400);
    }

    return shippingRepository.createCity(data);
  },

  async getAllCities(countryId?: string) {
    if (countryId) {
      const country = await shippingRepository.findCountryById(countryId);
      if (!country) {
        throw new AppError("Shipping country not found", 404);
      }
    }
    return shippingRepository.findAllCities(countryId);
  },

  async getCityById(id: string) {
    const city = await shippingRepository.findCityById(id);
    if (!city) {
      throw new AppError("Shipping city not found", 404);
    }
    return city;
  },

  async updateCity(id: string, data: UpdateShippingCityInput) {
    const city = await shippingRepository.findCityById(id);
    if (!city) {
      throw new AppError("Shipping city not found", 404);
    }

    const targetCountryId = data.countryId || city.countryId;
    const targetName = data.name || city.name;

    if (data.countryId && data.countryId !== city.countryId) {
      const country = await shippingRepository.findCountryById(data.countryId);
      if (!country) {
        throw new AppError("Shipping country not found", 404);
      }
    }

    if (targetName !== city.name || targetCountryId !== city.countryId) {
      const existing = await shippingRepository.findCityByNameAndCountry(
        targetName,
        targetCountryId
      );
      if (existing && existing.id !== id) {
        throw new AppError("City with this name already exists in this country", 400);
      }
    }

    return shippingRepository.updateCity(id, data);
  },

  async deleteCity(id: string) {
    const city = await shippingRepository.findCityById(id);
    if (!city) {
      throw new AppError("Shipping city not found", 404);
    }
    return shippingRepository.deleteCity(id);
  },
};
