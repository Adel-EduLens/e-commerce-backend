import prisma from "../utils/prismaClient.js";

class RetailBrandRepository {
  create(data: { name: string }) {
    return prisma.retailBrand.create({
      data,
    });
  }

  findAll() {
    return prisma.retailBrand.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.retailBrand.findUnique({
      where: {
        id,
      },
      include: {
        retailProducts: true,
      },
    });
  }

  findByName(name: string) {
    return prisma.retailBrand.findUnique({
      where: {
        name,
      },
    });
  }

  update(
    id: string,
    data: {
      name: string;
    },
  ) {
    return prisma.retailBrand.update({
      where: {
        id,
      },
      data,
    });
  }

  delete(id: string) {
    return prisma.retailBrand.delete({
      where: {
        id,
      },
    });
  }

  findTraderBrands(traderId: number) {
    return prisma.retailBrand.findMany({
      where: {
        retailProducts: {
          some: {
            traderId,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const retailBrandRepository = new RetailBrandRepository();
