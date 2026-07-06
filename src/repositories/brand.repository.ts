import prisma from "../utils/prismaClient.js";

class BrandRepository {
  async findAll() {
    return  prisma.brand.findMany();
  }

  async findById(id: string) {
    return  prisma.brand.findUnique({
      where: {
        id,
      },
    });
  }
  async create(data: any) {
    return  prisma.brand.create({
      data,
    });
  }
  async findByName(name: string) {
    return  prisma.brand.findUnique({
      where: {
        name,
      },
    });
  }
}

export const brandRepository = new BrandRepository();