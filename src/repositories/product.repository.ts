import prisma from "../utils/prismaClient.js";
import {
  ProductCreateData,
  ProductUpdateData,
} from "../types/product.types.js";

type GetProductsQuery = {

  search?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  traderId?: number | undefined;
  filter?: string;
  size?: string;
  color?: string;
  priceMin?: number | undefined;
  priceMax?: number | undefined;


  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;

  page?: number | undefined;
  limit?: number | undefined;
};
const FILTER_MAP: Record<
  string,
  { isMustHave?: boolean; isFlashDeals?: boolean }
> = {
  "must-have": { isMustHave: true },
  "flash-deals": { isFlashDeals: true },
};

class ProductRepository {
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

  create(data: ProductCreateData) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        rating: data.rating ?? 0,
        sizeguide: data.sizeguide ?? null,
        sku: data.sku ?? null,
        stock: data.stock ?? 0,

        isMustHave: data.isMustHave ?? false,
        isFlashDeals: data.isFlashDeals ?? false,
        flashDealPrice: data.flashDealPrice ?? null,
        flashDealEndsAt: data.flashDealEndsAt
          ? new Date(data.flashDealEndsAt)
          : null,

        trader: { connect: { id: data.traderId } },
        category: { connect: { id: data.categoryId } },

        ...(data.brandId && {
          brand: { connect: { id: data.brandId } },
        }),

        images: {
          create: data.images.map((image) => ({
            url: image.url,
            color: image.color,
          })),
        },

        sizes: {
          create: data.sizes.map((s: any) => typeof s === 'string' ? { size: s, quantity: 0 } : { size: s.size, quantity: s.quantity, color: s.color }),
        },

        colors: {
          create: data.colors.map((color) => ({ color })),
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
}: GetProductsQuery) {
  const priceRangeFilter =
    priceMin !== undefined || priceMax !== undefined
      ? {
          ...(priceMin !== undefined && { gte: priceMin }),
          ...(priceMax !== undefined && { lte: priceMax }),
        }
      : null;


  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      name: {
        contains: search,
      },
    });
  }

  if (priceRangeFilter) {
    andConditions.push({
      OR: [
        { isFlashDeals: true, flashDealPrice: priceRangeFilter },
        { isFlashDeals: false, price: priceRangeFilter },
      ],
    });
  }

  const where = {
    ...(categoryId && { categoryId }),
    ...(brandId && { brandId }),
    ...(traderId && { traderId }),
    ...(filter && FILTER_MAP[filter]),
    ...(size && { sizes: { some: { size } } }),
    ...(color && { colors: { some: { color } } }),
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const total = await prisma.product.count({ where });

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

  async findRecommendations({
    categories,
    limit = 4,
    excludeId,
    categoryId,
    size,
    color,
    sortBy,
    sortOrder = "desc",
  }: {
    categories?: string[] | undefined;
    limit?: number | undefined;
    excludeId?: string | undefined;
    categoryId?: string | undefined;
    size?: string | undefined;
    color?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
  }) {
    const where: any = {};

    if (excludeId) {
      where.id = { not: excludeId };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categories && categories.length > 0) {
      where.categoryId = { in: categories };
    }

    if (size) {
      where.sizes = { some: { size } };
    }

    if (color) {
      where.colors = { some: { color } };
    }

    const orderBy = this.getOrderBy(sortBy || "rating", sortOrder);

    const products = await prisma.product.findMany({
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

    if (
      products.length < limit &&
      !categoryId &&
      !size &&
      !color &&
      categories &&
      categories.length > 0
    ) {
      const existingIds = products.map((p) => p.id);
      if (excludeId) existingIds.push(excludeId);
      const remainingLimit = limit - products.length;
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
        },
        include: {
          category: true,
          brand: true,
          images: true,
          sizes: true,
          colors: true,
        },
        orderBy,
        take: remainingLimit,
      });
      products.push(...fallbackProducts);
    }

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

  async getFilters() {
    const categories = await prisma.category.findMany({ select: { name: true } });
    const brands = await prisma.brand.findMany({ select: { name: true } });
    
    const sizes = await prisma.productSize.findMany({ 
      select: { size: true },
      distinct: ['size'] 
    });
    
    const colors = await prisma.productColor.findMany({
      select: { color: true },
      distinct: ['color']
    });

    return {
      categories: categories.map((c) => c.name),
      brands: brands.map((b) => b.name),
      sizes: sizes.map((s) => s.size),
      colors: colors.map((c) => c.color)
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
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.sizeguide !== undefined && { sizeguide: data.sizeguide }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.stock !== undefined && { stock: data.stock }),

        ...(data.isMustHave !== undefined && { isMustHave: data.isMustHave }),
        ...(data.isFlashDeals !== undefined && {
          isFlashDeals: data.isFlashDeals,
        }),
        ...(data.flashDealPrice !== undefined && {
          flashDealPrice: data.flashDealPrice,
        }),
        ...(data.flashDealEndsAt !== undefined && {
          flashDealEndsAt: data.flashDealEndsAt
            ? new Date(data.flashDealEndsAt)
            : null,
        }),

        ...(data.categoryId && {
          category: { connect: { id: data.categoryId } },
        }),

        ...(data.brandId !== undefined && {
          brand: data.brandId
            ? { connect: { id: data.brandId } }
            : { disconnect: true },
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
            create: data.sizes.map((s: any) => typeof s === 'string' ? { size: s, quantity: 0 } : { size: s.size, quantity: s.quantity, color: s.color }),
          },
        }),

        ...(data.colors && {
          colors: {
            deleteMany: {},
            create: data.colors.map((color) => ({ color })),
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
    return prisma.product.findMany({
      where: { traderId },
      include: {
        category: true,
        brand: true,
        images: true,
        sizes: true,
        colors: true,
      },
      orderBy: { createdAt: "desc" },
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
