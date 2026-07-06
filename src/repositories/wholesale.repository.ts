import prisma from "../utils/prismaClient.js";
import {
  WholesaleCreateData,
  WholesaleUpdateData,
} from "../types/wholesale.types.js";

class WholesaleRepository {
  create(data: WholesaleCreateData) {
    return prisma.wholesale.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        minOrder: data.minOrder ?? 1,
        isBestDeal: data.isBestDeal ?? false,
        isMostPopular: data.isMostPopular ?? false,
        isPremiumCollection: data.isPremiumCollection ?? false,
        brand: data.brand,
        rating: data.rating ?? 0,
        trader: {
          connect: { id: data.traderId },
        },
        category: {
          connect: { id: data.categoryId },
        },
        images: {
          create: data.images.map((img) => ({ url: img.url, color: img.color ?? null })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  findAll({ search, categoryId, categoryName, isBestDeal, isMostPopular, isPremiumCollection }: { search?: string | undefined; categoryId?: string | undefined; categoryName?: string | undefined; isBestDeal?: boolean | undefined; isMostPopular?: boolean | undefined; isPremiumCollection?: boolean | undefined }) {
    return prisma.wholesale.findMany({
      where: {
        ...(search && {
          name: { contains: search },
        }),
        ...(categoryId && { categoryId }),
        ...(categoryName && { category: { name: { equals: categoryName } } }),
        ...(isBestDeal !== undefined && { isBestDeal }),
        ...(isMostPopular !== undefined && { isMostPopular }),
        ...(isPremiumCollection !== undefined && { isPremiumCollection }),
      },
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findByTraderId(traderId: number) {
    return prisma.wholesale.findMany({
      where: { traderId },
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.wholesale.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
      },
    });
  }

  update(id: string, data: WholesaleUpdateData) {
    return prisma.wholesale.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.minOrder !== undefined && { minOrder: data.minOrder }),
        ...(data.isBestDeal !== undefined && { isBestDeal: data.isBestDeal }),
        ...(data.isMostPopular !== undefined && { isMostPopular: data.isMostPopular }),
        ...(data.isPremiumCollection !== undefined && { isPremiumCollection: data.isPremiumCollection }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } },
        }),
        ...(data.images && {
          images: {
            deleteMany: {},
            create: data.images.map((img) => ({ url: img.url, color: img.color ?? null })),
          },
        }),
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  delete(id: string) {
    return prisma.wholesale.delete({
      where: { id },
    });
  }
}

export const wholesaleRepository = new WholesaleRepository();
