import prisma from '../utils/prismaClient.js'

export class ProductRatingRepository {
  async findByUserAndProduct(userId: number, productId: string) {
    return prisma.productRating.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })
  }

  async create(data: { userId: number; productId: string; rating: number }) {
    return prisma.productRating.create({
      data,
    })
  }

  async update(id: number, data: { rating: number }) {
    return prisma.productRating.update({
      where: { id },
      data,
    })
  }

  async averageRating(productId: string) {
    return prisma.productRating.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
    })
  }
}

export const productRatingRepository = new ProductRatingRepository()
