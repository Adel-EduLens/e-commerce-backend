import prismaClient from "../utils/prismaClient.js";

export class RetailCategoryRepository {
  async findAll() {
    return prismaClient.category.findMany({
      where: { isRetail: true },
      include: {
        retailProducts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prismaClient.category.findFirst({
      where: { id, isRetail: true },
      include: {
        retailProducts: true,
      },
    });
  }

  async findByName(name: string) {
    return prismaClient.category.findFirst({
      where: { name, isRetail: true },
    });
  }

  async create(data: {
    name: string;
    image?: string;
    appearOnHome?: boolean;
  }) {
    return prismaClient.category.create({
      data: { ...data, isRetail: true, isWholesale: false },
      include: {
        retailProducts: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      image: string;
      appearOnHome: boolean;
    }>,
  ) {
    return prismaClient.category.update({
      where: { id },
      data,
      include: {
        retailProducts: true,
      },
    });
  }

  async delete(id: string) {
    return prismaClient.category.delete({
      where: { id },
    });
  }

  async getCategoryUsage(id: number) {
    const products = await prismaClient.retailProduct.count({
      where: {
        categoryId: id.toString(),
      },
    });

    return {
      products,
    };
  }

}
