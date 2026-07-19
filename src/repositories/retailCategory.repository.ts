import prismaClient from "../utils/prismaClient.js";

export class RetailCategoryRepository {
  async findAll() {
    return prismaClient.retailCategory.findMany({
      include: {
        retailProducts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: number) {
    return prismaClient.retailCategory.findUnique({
      where: { id },
      include: {
        retailProducts: true,
      },
    });
  }

  async findByName(name: string) {
    return prismaClient.retailCategory.findUnique({
      where: { name },
    });
  }

  async create(data: { name: string; image?: string; appearOnHome?: boolean }) {
    return prismaClient.retailCategory.create({
      data,
      include: {
        retailProducts: true,
      },
    });
  }

  async update(
    id: number,
    data: Partial<{
      name: string;
      image: string;
      appearOnHome: boolean;
    }>,
  ) {
    return prismaClient.retailCategory.update({
      where: { id },
      data,
      include: {
        retailProducts: true,
      },
    });
  }

  async delete(id: number) {
    return prismaClient.retailCategory.delete({
      where: { id },
    });
  }
  async getCategoryUsage(id: number) {
    const products = await prismaClient.retailProduct.count({
      where: {
        categoryId: id,
      },
    });

    return {
      products,
    };
  }
}
