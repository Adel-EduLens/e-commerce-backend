
import prisma from "../utils/prismaClient.js";
import { ProductCreateData, ProductUpdateData } from "../types/product.types.js";

class ProductRepository {
  create(data: ProductCreateData) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        brand: data.brand,
        rating: data.rating ?? 0,
        reviews: data.reviews,
        trader: {
          connect: {
            id: data.traderId,
          },
        },
        category: {
          connect: { id: data.categoryId },
        },

        images: {
          create: data.images.map((url) => ({
            url,
          })),
        },

        sizes: {
          create: data.sizes.map((size) => ({
            size,
          })),
        },

        colors: {
          create: data.colors.map((color) => ({
            color,
          })),
        },
      },

      include: {
        category: true,
        images: true,
        sizes: true,
        colors: true,
      },
    });
  }

  findAll({
    search,
    categoryId,
  }: {
    search?: string;
    categoryId?: string;
  }) {
    return prisma.product.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
          },
        }),

        ...(categoryId && {
          categoryId,
        }),
      },

      include: {
        category: true,
        images: true,
        sizes: true,
        colors: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  findById(id: string) {
    return prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        category: true,
        images: true,
        sizes: true,
        colors: true,
      },
    });
  }

  update(id: string, data: ProductUpdateData) {
    return prisma.product.update({
      where: {
        id,
      },

      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.reviews !== undefined && { reviews: data.reviews }),

        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } },
        }),

        ...(data.images && {
          images: {
            deleteMany: {},
            create: data.images.map((url) => ({
              url,
            })),
          },
        }),

        ...(data.sizes && {
          sizes: {
            deleteMany: {},
            create: data.sizes.map((size) => ({
              size,
            })),
          },
        }),

        ...(data.colors && {
          colors: {
            deleteMany: {},
            create: data.colors.map((color) => ({
              color,
            })),
          },
        }),
      },

      include: {
        category: true,
        images: true,
        sizes: true,
        colors: true,
      },
    });
  }

  delete(id: string) {
    return prisma.product.delete({
      where: {
        id,
      },
    });
  }
}

export const productRepository = new ProductRepository();