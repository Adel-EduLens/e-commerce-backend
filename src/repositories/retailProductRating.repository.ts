import prisma from '../utils/prismaClient.js'

export class RetailProductRatingRepository {
  async findByUserAndProduct(userId: number, retailProductId: number) {
    return prisma.retailProductRating.findUnique({
      where: {
        userId_retailProductId: {
          userId,
          retailProductId,
        },
      },
    })
  }

  async create(data: { userId: number; retailProductId: number; rating: number }) {
    return prisma.retailProductRating.create({
      data,
    })
  }

  async update(id: number, data: { rating: number }) {
    return prisma.retailProductRating.update({
      where: { id },
      data,
    })
  }

  async averageRating(retailProductId: number) {
    return prisma.retailProductRating.aggregate({
      where: { retailProductId },
      _avg: {
        rating: true,
      },
    })
  }
}

export const retailProductRatingRepository = new RetailProductRatingRepository()
