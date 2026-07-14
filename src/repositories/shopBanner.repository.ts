import prisma from "../utils/prismaClient.js";
import type { Prisma } from "@prisma/client";

class ShopBannerRepository {
  async create(data: Prisma.ShopBannerCreateInput) {
    return prisma.shopBanner.create({
      data,
    });
  }

  async findAll(type?: string) {
    return prisma.shopBanner.findMany({
      ...(type ? { where: { type } } : {}),
      orderBy: {
        order: "asc",
      },
    });
  }

  async findActive(type?: string) {
    return prisma.shopBanner.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
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
