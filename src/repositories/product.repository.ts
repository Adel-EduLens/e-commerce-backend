import prisma from "../utils/prismaClient.js";
import {
  ProductCreateData,
  ProductUpdateData,
  TraderProductCreateData,
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

  create(data: TraderProductCreateData | ProductCreateData) {
    let colorsData: any[];

    if (data.colors && data.colors.length > 0 && typeof data.colors[0] === "string") {
      const oldData = data as ProductCreateData;
      colorsData = oldData.colors.map((colorName) => {
        const colorImages = oldData.images.filter((img) => img.color === colorName);
        return {
          colorName,
          colorCode: null,
          images: {
            create: colorImages.map((img) => ({
              imageUrl: img.url,
              isPrimary: false,
            })),
          },
          variants: {
            create: oldData.sizes.map((size) => ({
              size,
              quantity: oldData.stock ? Math.ceil(oldData.stock / oldData.sizes.length) : 0,
              sku: oldData.sku ?? null,
            })),
          },
        };
      });
    } else {
      const newData = data as TraderProductCreateData;
      colorsData = newData.colors.map((color) => ({
        colorName: color.colorName,
        colorCode: color.colorCode ?? null,
        images: {
          create: color.images.map((img) => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary ?? false,
          })),
        },
        variants: {
          create: color.variants.map((v) => ({
            size: v.size,
            quantity: v.quantity,
            sku: v.sku ?? null,
          })),
        },
      }));
    }

    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        rating: 0,
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

        colors: {
          create: colorsData,
        },
      },

      include: {
        category: true,
        brand: true,
        colors: {
          include: {
            images: true,
            variants: true,
          },
        },
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
    ...(size && { colors: { some: { variants: { some: { size } } } } }),
    ...(color && { colors: { some: { colorName: color } } }),
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const total = await prisma.product.count({ where });

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      brand: true,
      colors: {
        include: {
          images: true,
          variants: true,
        },
      },
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

  async getFilters() {
    const categories = await prisma.category.findMany({ select: { name: true } });
    const brands = await prisma.brand.findMany({ select: { name: true } });
    
    const sizes = await prisma.productVariant.findMany({ 
      select: { size: true },
      distinct: ['size'] 
    });
    
    const colors = await prisma.productColor.findMany({
      select: { colorName: true },
      distinct: ['colorName']
    });

    return {
      categories: categories.map((c) => c.name),
      brands: brands.map((b) => b.name),
      sizes: sizes.map((s) => s.size),
      colors: colors.map((c) => c.colorName)
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
        colors: {
          include: {
            images: true,
            variants: true,
          },
        },
      },
    });
  }

  update(id: string, data: Partial<ProductUpdateData>) {
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
      },

      include: {
        category: true,
        brand: true,
        colors: {
          include: {
            images: true,
            variants: true,
          },
        },
      },
    });
  }

  findByTraderId(traderId: number) {
    return prisma.product.findMany({
      where: { traderId },
      include: {
        category: true,
        brand: true,
        colors: {
          include: {
            images: true,
            variants: true,
          },
        },
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

  async findDetailsById(id: string, userId?: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        colors: {
          include: {
            images: true,
            variants: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
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
        },
      },
    });

    if (!product) return null;

    let isFavorite = false;
    if (userId) {
      const fav = await prisma.wishlistItem.findFirst({
        where: {
          userId,
          shopProductId: id,
        },
      });
      isFavorite = !!fav;
    }

    return {
      product,
      isFavorite,
    };
  }

  async findRecommended(productId: string, categoryId: string, limit: number = 8) {
    return prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
      },
      take: limit,
      include: {
        brand: true,
        category: true,
        colors: {
          include: {
            images: true,
            variants: true,
          },
        },
      },
      orderBy: {
        rating: "desc",
      },
    });
  }
}

export const productRepository = new ProductRepository();
