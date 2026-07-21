import prisma from "../utils/prismaClient.js";
import type {
  CreateShippingCountryInput,
  UpdateShippingCountryInput,
  CreateShippingCityInput,
  UpdateShippingCityInput,
} from "../types/shipping.type.js";

class ShippingRepository {
  // --- Shipping Country ---

  async createCountry(data: CreateShippingCountryInput) {
    return (prisma as any).shippingCountry.create({
      data,
      include: {
        cities: true,
      },
    });
  }

  async findAllCountries() {
    return (prisma as any).shippingCountry.findMany({
      include: {
        cities: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findCountryById(id: string) {
    return (prisma as any).shippingCountry.findUnique({
      where: { id },
      include: {
        cities: true,
      },
    });
  }

  async findCountryByName(name: string) {
    return (prisma as any).shippingCountry.findUnique({
      where: { name },
    });
  }

  async updateCountry(id: string, data: UpdateShippingCountryInput) {
    return (prisma as any).shippingCountry.update({
      where: { id },
      data,
      include: {
        cities: true,
      },
    });
  }

  async deleteCountry(id: string) {
    return (prisma as any).shippingCountry.delete({
      where: { id },
    });
  }

  // --- Shipping City ---

  async createCity(data: CreateShippingCityInput) {
    return (prisma as any).shippingCity.create({
      data,
      include: {
        country: true,
      },
    });
  }

  async findAllCities(countryId?: string) {
    return (prisma as any).shippingCity.findMany({
      where: countryId ? { countryId } : undefined,
      include: {
        country: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findCityById(id: string) {
    return (prisma as any).shippingCity.findUnique({
      where: { id },
      include: {
        country: true,
      },
    });
  }

  async findCityByNameAndCountry(name: string, countryId: string) {
    return (prisma as any).shippingCity.findUnique({
      where: {
        name_countryId: {
          name,
          countryId,
        },
      },
    });
  }

  async updateCity(id: string, data: UpdateShippingCityInput) {
    return (prisma as any).shippingCity.update({
      where: { id },
      data,
      include: {
        country: true,
      },
    });
  }

  async deleteCity(id: string) {
    return (prisma as any).shippingCity.delete({
      where: { id },
    });
  }
}

export const shippingRepository = new ShippingRepository();
