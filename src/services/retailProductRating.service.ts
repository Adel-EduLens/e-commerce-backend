import { retailProductRatingRepository } from '../repositories/retailProductRating.repository.js'
import prismaClient from '../utils/prismaClient.js'
import AppError from '../utils/AppError.util.js'

export class RetailProductRatingService {
  async rateProduct(userId: number, retailProductId: number, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400)
    }

    // Check product exists
    const product = await prismaClient.retailProduct.findUnique({
      where: { id: retailProductId },
    })
    if (!product || !product.isActive) {
      throw new AppError('Retail product not found or inactive', 404)
    }

    // Upsert the user's rating
    const existing = await retailProductRatingRepository.findByUserAndProduct(userId, retailProductId)
    let userRating
    if (existing) {
      userRating = await retailProductRatingRepository.update(existing.id, { rating })
    } else {
      userRating = await retailProductRatingRepository.create({ userId, retailProductId, rating })
    }

    // Compute new average
    const aggregate = await retailProductRatingRepository.averageRating(retailProductId)
    const averageRating = aggregate._avg.rating ?? rating

    return {
      userRating: userRating.rating,
      averageRating: Math.round(averageRating * 10) / 10,
    }
  }

  async getProductRatings(retailProductId: number) {
    const product = await prismaClient.retailProduct.findUnique({
      where: { id: retailProductId },
    })
    if (!product) {
      throw new AppError('Retail product not found', 404)
    }

    const aggregate = await retailProductRatingRepository.averageRating(retailProductId)
    const averageRating = aggregate._avg.rating ?? 0

    return {
      retailProductId,
      averageRating: Math.round(averageRating * 10) / 10,
    }
  }
}
