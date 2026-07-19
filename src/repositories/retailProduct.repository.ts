import prisma from "../utils/prismaClient.js";
import { Prisma } from "@prisma/client";

type Transaction = Prisma.TransactionClient;

const FILTER_MAP: Record<string, Prisma.RetailProductWhereInput> = {
  featured: {
    isFeatured: true,
  },
};

class RetailProductRepository {
  getOrderBy = (sortBy?: string, sortOrder: "asc" | "desc" = "asc") => {
    switch (sortBy) {
      case "name":
        return { name: sortOrder };

      case "price":
        return { price: sortOrder };

      case "rating":
        return { rating: sortOrder };

      case "createdAt":
        return { createdAt: sortOrder };

      default:
        return { createdAt: "desc" as const };
    }
  };

  create(data: any) {
    return prisma.retailProduct.create({
      data: {
        name: data.name,

        description: data.description ?? null,

        price: data.price,

        stock: data.stock ?? 0,

        sku: data.sku ?? null,

        isFeatured: data.isFeatured ?? false,

        depositAmount: data.depositAmount,

        securityDeposit: data.securityDeposit,

        termsAndConditions: data.termsAndConditions ?? null,

        privacyPolicy: data.privacyPolicy ?? null,

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
          create: (data.images ?? []).map((image: any) => ({
            url: image.url,

            color: image.color ?? null,
          })),
        },

        sizes: {
          create: (data.sizes ?? []).map((size: any) =>
            typeof size === "string"
              ? {
                  size,
                  quantity: 0,
                }
              : {
                  size: size.size,

                  quantity: size.quantity ?? 0,

                  color: size.color ?? null,
                },
          ),
        },

        colors: {
          create: (data.colors ?? []).map((color: string) => ({
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

    traderId,
    filter,
    size,

    color,

    priceMin,

    priceMax,

    sortBy,

    sortOrder = "asc",

    page = 1,

    limit = 16,
  }: any) {
    const priceRangeFilter =
      priceMin !== undefined || priceMax !== undefined
        ? {
            ...(priceMin !== undefined && {
              gte: priceMin,
            }),

            ...(priceMax !== undefined && {
              lte: priceMax,
            }),
          }
        : null;

    const andConditions: Prisma.RetailProductWhereInput[] = [];

    if (search) {
      andConditions.push({
        name: {
          contains: search,
        },
      });
    }

    if (priceRangeFilter) {
      andConditions.push({
        price: priceRangeFilter,
      });
    }

    const where: Prisma.RetailProductWhereInput = {
      ...(categoryId && {
        categoryId,
      }),

      ...(filter && FILTER_MAP[filter]),

      ...(brandId && {
        brandId,
      }),

      ...(traderId && {
        traderId,
      }),

      ...(size && {
        sizes: {
          some: {
            size,
          },
        },
      }),

      ...(color && {
        colors: {
          some: {
            color,
          },
        },
      }),

      ...(andConditions.length && {
        AND: andConditions,
      }),
    };

    const total = await prisma.retailProduct.count({
      where,
    });

    const products = await prisma.retailProduct.findMany({
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

  async findRecommendations({
    categories,

    limit = 4,

    excludeId,

    categoryId,

    size,

    color,

    sortBy,

    sortOrder = "desc",
  }: any) {
    const where: any = {};

    if (excludeId) {
      where.id = {
        not: excludeId,
      };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categories && categories.length) {
      where.categoryId = {
        in: categories,
      };
    }

    if (size) {
      where.sizes = {
        some: {
          size,
        },
      };
    }

    if (color) {
      where.colors = {
        some: {
          color,
        },
      };
    }

    const orderBy = this.getOrderBy(sortBy || "rating", sortOrder);

    const products = await prisma.retailProduct.findMany({
      where,

      include: {
        category: true,

        brand: true,

        images: true,

        sizes: true,

        colors: true,
      },

      orderBy,

      take: limit,
    });

    return {
      products,

      pagination: {
        page: 1,

        limit,

        total: products.length,

        totalPages: 1,
      },
    };
  }

  findById(id: number) {
    return prisma.retailProduct.findUnique({
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

  update(id: number, data: any) {
    return prisma.retailProduct.update({
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

        ...(data.price !== undefined && {
          price: data.price,
        }),

        ...(data.sku !== undefined && {
          sku: data.sku,
        }),

        ...(data.stock !== undefined && {
          stock: data.stock,
        }),

        ...(data.isFeatured !== undefined && {
          isFeatured: data.isFeatured,
        }),

        ...(data.depositAmount !== undefined && {
          depositAmount: data.depositAmount,
        }),

        ...(data.securityDeposit !== undefined && {
          securityDeposit: data.securityDeposit,
        }),

        ...(data.termsAndConditions !== undefined && {
          termsAndConditions: data.termsAndConditions,
        }),

        ...(data.privacyPolicy !== undefined && {
          privacyPolicy: data.privacyPolicy,
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

            create: data.images.map((image: any) => ({
              url: image.url,

              color: image.color ?? null,
            })),
          },
        }),

        ...(data.sizes && {
          sizes: {
            deleteMany: {},

            create: data.sizes.map((size: any) =>
              typeof size === "string"
                ? {
                    size,

                    quantity: 0,
                  }
                : {
                    size: size.size,

                    quantity: size.quantity ?? 0,

                    color: size.color ?? null,
                  },
            ),
          },
        }),

        ...(data.colors && {
          colors: {
            deleteMany: {},

            create: data.colors.map((color: string) => ({
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

  findByTraderId(traderId: number) {
    return prisma.retailProduct.findMany({
      where: {
        traderId,
      },

      include: {
        category: true,

        brand: true,

        images: true,

        sizes: true,

        colors: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  delete(id: number) {
    return prisma.retailProduct.delete({
      where: {
        id,
      },
    });
  }

  updateRating(id: number, rating: number, tx: Transaction = prisma) {
    return tx.retailProduct.update({
      where: {
        id,
      },

      data: {
        rating,
      },
    });
  }

  async categoryExists(categoryId: string) {
    return prisma.category.findFirst({
      where: { id: categoryId, isRetail: true },
    });
  }

  async brandExists(id: string) {
    return prisma.retailBrand.findUnique({
      where: {
        id,
      },
    });
  }
}

export const retailProductRepository = new RetailProductRepository();
