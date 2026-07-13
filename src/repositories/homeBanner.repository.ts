import prisma from "../utils/prismaClient.js";
import type { Prisma } from "@prisma/client";

class HomeBannerRepository {
  async create(data: Prisma.HomeBannerCreateInput) {
    return prisma.homeBanner.create({
      data,
    });
  }

  async findAll() {
    return prisma.homeBanner.findMany({
      orderBy: {
        order: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.homeBanner.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, data: Prisma.HomeBannerUpdateInput) {
    return prisma.homeBanner.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return prisma.homeBanner.delete({
      where: {
        id,
      },
    });
  }
}

export const homeBannerRepository = new HomeBannerRepository();
