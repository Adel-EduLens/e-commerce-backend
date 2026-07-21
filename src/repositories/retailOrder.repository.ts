import prismaClient from "../utils/prismaClient.js";
import { ProductType } from "@prisma/client";

class RetailOrderRepository {
  async create(data: any) {
    return prismaClient.retailOrder.create({
      data,
      include: {
        product: true,
      },
    });
  }

  async findById(id: string) {
    return prismaClient.retailOrder.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });
  }

  async findByUser(userId: number) {
    return prismaClient.retailOrder.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findAll() {
    return prismaClient.retailOrder.findMany({
      include: {
        user: true,
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: string, data: any) {
    return prismaClient.retailOrder.update({
      where: {
        id,
      },
      data,
    });
  }

  async productExists(id: string) {
    return prismaClient.product.findFirst({
      where: {
        id,
        productTypes: { some: { type: ProductType.RETAIL } },
      },
    });
  }
}
export const retailOrderRepository = new RetailOrderRepository()
