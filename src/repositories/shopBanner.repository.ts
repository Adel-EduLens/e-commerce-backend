import prisma from "../utils/prismaClient.js";
import type { Prisma } from "@prisma/client";

class ShopBannerRepository {
  async create(data: Prisma.ShopBannerCreateInput) {
    return prisma.shopBanner.create({
      data,
    });
  }

  async findAll() {
    return prisma.shopBanner.findMany({
      orderBy: {
        order: "asc",
      },
    });
  }

  async findActive() {
    return prisma.shopBanner.findMany({
      where: {
        isActive: true,
      },

      orderBy: {
        order: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.shopBanner.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: Prisma.ShopBannerUpdateInput) {
    return prisma.shopBanner.update({
      where: {
        id,
      },

      data,
    });
  }

  async delete(id: string) {
    return prisma.shopBanner.delete({
      where: {
        id,
      },
    });
  }
}

export const shopBannerRepository = new ShopBannerRepository();
