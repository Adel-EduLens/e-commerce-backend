import { RetailProductRepository } from "../repositories/retailProduct.repository.js";
import AppError from "../utils/AppError.util.js";
import { Prisma } from "@prisma/client";
import prismaClient from "../utils/prismaClient.js";

const retailProductRepository = new RetailProductRepository();

async function notifyRetailRestock(
  productId: number,
  productName: string,
  imageUrl?: string,
) {
  const subscribers = await prismaClient.notifyMeSubscription.findMany({
    where: {
      targetType: "RETAIL_RESTOCK",
      targetId: String(productId),
      isActive: true,
    },
  });
  if (subscribers.length === 0) return;
  await prismaClient.userNotification.createMany({
    data: subscribers.map((s) => ({
      userId: s.userId,
      title: "Retail Product Back in Stock!",
      message: `Great news! "${productName}" is now back in stock. Grab it before it's gone!`,
      type: "restock",
      productId: String(productId),
      imageUrl: imageUrl ?? null,
    })),
  });
  await prismaClient.notifyMeSubscription.updateMany({
    where: {
      targetType: "RETAIL_RESTOCK",
      targetId: String(productId),
      isActive: true,
    },
    data: { isActive: false },
  });
}

export class RetailProductService {
  async getAllProducts(filters?: {
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: "latest" | "price_asc" | "price_desc";
    featured?: boolean;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    return retailProductRepository.findAll(filters);
  }

  async getProductById(id: number) {
    const product = await retailProductRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await retailProductRepository.findBySlug(slug);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    price: number;
    discountPrice?: number;
    stock?: number;
    sku?: string;
    brand?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    categoryId: number;
    images?: { url: string; alt?: string; isMain?: boolean }[];
    colors?: { name: string; hexCode?: string }[];
    sizes?: { name: string; stock?: number }[];
    depositAmount?: number;
    securityDeposit?: number;
    termsAndConditions?: string;
    privacyPolicy?: string;
  }) {
    // Validate category exists
    const category = await retailProductRepository.categoryExists(
      data.categoryId,
    );
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // Validate slug uniqueness
    const existingSlug = await retailProductRepository.existsBySlug(data.slug);
    if (existingSlug) {
      throw new AppError("Slug already exists", 400);
    }

    // Validate SKU uniqueness if provided
    if (data.sku) {
      const existingSku = await retailProductRepository.existsBySku(data.sku);
      if (existingSku) {
        throw new AppError("SKU already exists", 400);
      }
    }

    return retailProductRepository.create(data);
  }

  async updateProduct(
    id: number,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      shortDescription: string;
      price: number;
      discountPrice: number;
      stock: number;
      sku: string;
      brand: string;
      isFeatured: boolean;
      isActive: boolean;
      categoryId: number;
      depositAmount: number;
      securityDeposit: number;
      termsAndConditions: string;
      privacyPolicy: string;
    }>,
  ) {
    const product = await retailProductRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Validate category if being updated
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await retailProductRepository.categoryExists(
        data.categoryId,
      );
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    // Validate slug uniqueness if being updated
    if (data.slug && data.slug !== product.slug) {
      const existing = await retailProductRepository.existsBySlug(
        data.slug,
        id,
      );
      if (existing) {
        throw new AppError("Slug already exists", 400);
      }
    }

    // Validate SKU uniqueness if being updated
    if (data.sku && data.sku !== product.sku) {
      const existing = await retailProductRepository.existsBySku(data.sku, id);
      if (existing) {
        throw new AppError("SKU already exists", 400);
      }
    }

    const oldStock = product.stock ?? 0;
    const newStock = data.stock !== undefined ? data.stock : oldStock;
    const updated = await retailProductRepository.update(id, data);

    if (oldStock <= 0 && newStock > 0) {
      const imageUrl = (product as any).images?.[0]?.url;
      await notifyRetailRestock(id, product.name, imageUrl);
    }

    return updated;
  }

  async updateProductWithRelations(
    id: number,
    data: {
      product?: Partial<{
        name: string;
        slug: string;
        description: string;
        shortDescription: string;
        price: number;
        discountPrice: number;
        stock: number;
        sku: string;
        brand: string;
        isFeatured: boolean;
        isActive: boolean;
        categoryId: number;
        depositAmount: number;
        securityDeposit: number;
        termsAndConditions: string;
        privacyPolicy: string;
      }>;
      images?: { url: string; alt?: string; isMain?: boolean }[];
      colors?: { name: string; hexCode?: string }[];
      sizes?: { name: string; stock?: number }[];
    },
  ) {
    const product = await retailProductRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Validate category if being updated
    if (
      data.product?.categoryId &&
      data.product.categoryId !== product.categoryId
    ) {
      const category = await retailProductRepository.categoryExists(
        data.product.categoryId,
      );
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    // Validate slug uniqueness if being updated
    if (data.product?.slug && data.product.slug !== product.slug) {
      const existing = await retailProductRepository.existsBySlug(
        data.product.slug,
        id,
      );
      if (existing) {
        throw new AppError("Slug already exists", 400);
      }
    }

    // Validate SKU uniqueness if being updated
    if (data.product?.sku && data.product.sku !== product.sku) {
      const existing = await retailProductRepository.existsBySku(
        data.product.sku,
        id,
      );
      if (existing) {
        throw new AppError("SKU already exists", 400);
      }
    }

    const oldStock = product.stock ?? 0;
    const newStock =
      data.product?.stock !== undefined ? data.product.stock : oldStock;
    const updated = await retailProductRepository.updateWithRelations(id, data);

    if (oldStock <= 0 && newStock > 0) {
      const imageUrl = (product as any).images?.[0]?.url;
      await notifyRetailRestock(id, product.name, imageUrl);
    }

    return updated;
  }

  async deleteProduct(id: number) {
    const product = await retailProductRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return retailProductRepository.delete(id);
  }
}
