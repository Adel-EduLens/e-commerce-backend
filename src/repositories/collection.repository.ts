import prisma from "../utils/prismaClient.js";
import type { Prisma } from "@prisma/client";

class CollectionRepository {
  async create(data: { name: string; description?: string; image: string; appearOnHome?: boolean; productIds?: string[] }) {
    const { productIds, ...rest } = data;
    const payload: Prisma.CollectionCreateInput = {
      ...rest,
    };
    if (productIds && productIds.length > 0) {
      payload.products = {
        connect: productIds.map(id => ({ id }))
      };
    }
    return prisma.collection.create({
      data: payload,
      include: {
        products: true
      }
    });
  }

  async findAll(appearOnHome?: boolean) {
    return prisma.collection.findMany({
      where: {
        ...(appearOnHome !== undefined && { appearOnHome }),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        products: true,
        _count: {
          select: {
            products: true
          }
        }
      },
    });
  }

  async findById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            images: true
          }
        }
      },
    });
  }

  async findByName(name: string) {
    return prisma.collection.findUnique({
      where: { name },
    });
  }

  async update(id: string, data: { name?: string; description?: string; image?: string; appearOnHome?: boolean; productIds?: string[] }) {
    const { productIds, ...rest } = data;
    const payload: Prisma.CollectionUpdateInput = {
      ...rest,
    };
    if (productIds) {
      payload.products = {
        set: productIds.map(pid => ({ id: pid }))
      };
    }
    return prisma.collection.update({
      where: { id },
      data: payload,
      include: {
        products: true
      }
    });
  }

  async delete(id: string) {
    return prisma.collection.delete({
      where: { id },
    });
  }
}

export const collectionRepository = new CollectionRepository();
