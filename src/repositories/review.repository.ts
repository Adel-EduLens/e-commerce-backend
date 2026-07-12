import prisma from "../utils/prismaClient.js";
import { ReviewCreateData, ReviewUpdateData } from "../types/review.types.js";
import { Prisma } from "@prisma/client";
type Transaction = Prisma.TransactionClient;

export const reviewRepository = {
  async create(data: ReviewCreateData, tx: Transaction = prisma) {
    return tx.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async findAllByProduct(productId: string) {
    return prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findById(id: string) {
    return prisma.review.findUnique({
      where: {
        id,
      },
    });
  },

  async findByUserAndProduct(userId: number, productId: string) {
    return prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  },

  async update(id: string, data: ReviewUpdateData, tx: Transaction = prisma) {
    return tx.review.update({
      where: {
        id,
      },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  async delete(id: string, tx: Transaction = prisma) {
    return tx.review.delete({
      where: {
        id,
      },
    });
  },

  async getAverageRating(productId: string, tx: Transaction = prisma) {
    const result = await tx.review.aggregate({
      where: {
        productId,
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating ?? 0;
  },
};
