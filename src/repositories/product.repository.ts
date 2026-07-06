import prisma from "../utils/prismaClient.js";
import {
  ProductCreateData,
  ProductUpdateData,
} from "../types/product.types.js";

type GetProductsQuery = {
  search?: string;
  categoryId?: string;
  brandId?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";

  page?: number;
  limit?: number;
};

class ProductRepository {
  getOrderBy = (sortBy?: string, sortOrder: "asc" | "desc" = "asc") => {
    switch (sortBy) {
      case "name":
        return {
          name: sortOrder,
        };

      case "price":
        return {
          price: sortOrder,
        };

      case "rating":
        return {
          rating: sortOrder,
        };

      case "createdAt":
        return {
          createdAt: sortOrder,
        };

      default:
        return {
          createdAt: "desc" as const,
        };
    }
  };

  create(data: ProductCreateData) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        rating: data.rating ?? 0,
        sizeguide: data.sizeguide ?? null,

        trader: {
          connect: {
            id: data.traderId,
          },
        },

        category: {
          connect: {
            id: data.categoryId,
          },
        },

        ...(data.brandId && {
          brand: {
            connect: {
              id: data.brandId,
            },
          },
        }),

        images: {
          create: data.images.map((image) => ({
            url: image.url,
            color: image.color,
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
        brand: true,
        images: true,
        sizes: true,
        colors: true,
      },
    });
  }

  async findAll({
    search,
    categoryId,
    brandId,
    sortBy,
    sortOrder = "asc",
    page = 1,
    limit = 16,
  }: GetProductsQuery) {
    const where = {
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            category: {
              name: {
                contains: search,
              },
            },
          },
          {
            brand: {
              name: {
                contains: search,
              },
            },
          },
        ],
      }),

      ...(categoryId && {
        categoryId,
      }),

      ...(brandId && {
        brandId,
      }),
    };

    const total = await prisma.product.count({
      where,
    });

    const products = await prisma.product.findMany({
      where,

      include: {
        category: true,
        brand: true,
        images: true,
        sizes: true,
        colors: true,
      },

      orderBy: this.getOrderBy(sortBy, sortOrder),

      skip: (page - 1) * limit,

      take: limit,
    });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  findById(id: string) {
    return prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        category: true,
        brand: true,
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
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.sizeguide !== undefined && {
          sizeguide: data.sizeguide,
        }),
        ...(data.price !== undefined && {
          price: data.price,
        }),

        ...(data.rating !== undefined && {
          rating: data.rating,
        }),

        ...(data.categoryId && {
          category: {
            connect: {
              id: data.categoryId,
            },
          },
        }),

        ...(data.brandId !== undefined && {
          brand: data.brandId
            ? {
                connect: {
                  id: data.brandId,
                },
              }
            : {
                disconnect: true,
              },
        }),

        ...(data.images && {
          images: {
            deleteMany: {},
            create: data.images.map((image) => ({
              url: image.url,
              color: image.color,
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
        brand: true,
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

  updateRating(id: string, rating: number) {
    return prisma.product.update({
      where: {
        id,
      },

      data: {
        rating,
      },
    });
  }
}

export const productRepository = new ProductRepository();
