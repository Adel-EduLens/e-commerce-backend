import prisma from "../utils/prismaClient.js";
import {
  ReviewCreateData,
  ReviewUpdateData,
} from "../types/review.types.js";

export const reviewRepository = {
  async create(data : ReviewCreateData) {
    return prisma.review.create({
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

  async findAllByProduct(productId : string) {
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

  async update(id: string, data : ReviewUpdateData) {
    return prisma.review.update({
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

  async delete(id: string) {
    return prisma.review.delete({
      where: {
        id,
      },
    });
  },

  async getAverageRating(productId: string) {
    const result = await prisma.review.aggregate({
      where: {
        productId,
      },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating ?? 0;
  },

  async findPaginatedReviews(
    productId: string,
    options: { page: number; limit: number; rating?: number; sort?: string }
  ) {
    const { page, limit, rating, sort } = options;

    const where: any = {
      productId,
      ...(rating !== undefined && { rating }),
    };

    let orderBy: any = { createdAt: "desc" };
    if (sort === "highest") {
      orderBy = { rating: "desc" };
    } else if (sort === "lowest") {
      orderBy = { rating: "asc" };
    } else if (sort === "helpful") {
      orderBy = { helpfulCount: "desc" };
    }

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          images: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};