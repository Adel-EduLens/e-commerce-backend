import prismaClient from '../utils/prismaClient.js'
import { Prisma } from '@prisma/client'

export class RetailProductRepository {
  async findAll(filters?: {
    search?: string
    categoryId?: number
    minPrice?: number
    maxPrice?: number
    sort?: 'latest' | 'price_asc' | 'price_desc'
    featured?: boolean
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const skip = ((filters?.page || 1) - 1) * (filters?.limit || 10)
    const take = filters?.limit || 10

    const where: Prisma.RetailProductWhereInput = {
      ...(filters?.search && {
        name: { contains: filters.search }
      }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.minPrice !== undefined || filters?.maxPrice !== undefined) && {
        price: {
          ...(filters?.minPrice !== undefined && { gte: filters.minPrice }),
          ...(filters?.maxPrice !== undefined && { lte: filters.maxPrice })
        }
      },
      ...(filters?.featured !== undefined && { isFeatured: filters.featured }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive })
    }

    const orderBy: any = {}
    if (filters?.sort === 'latest') {
      orderBy.createdAt = 'desc'
    } else if (filters?.sort === 'price_asc') {
      orderBy.price = 'asc'
    } else if (filters?.sort === 'price_desc') {
      orderBy.price = 'desc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const [data, total] = await Promise.all([
      prismaClient.retailProduct.findMany({
        where,
        include: {
          category: true,
          images: true,
          colors: true,
          sizes: true
        },
        orderBy,
        skip,
        take
      }),
      prismaClient.retailProduct.count({ where })
    ])

    return {
      data,
      pagination: {
        total,
        page: filters?.page || 1,
        limit: take,
        pages: Math.ceil(total / take)
      }
    }
  }

  async findById(id: number) {
    return prismaClient.retailProduct.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        colors: true,
        sizes: true
      }
    })
  }

  async findBySlug(slug: string) {
    return prismaClient.retailProduct.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        colors: true,
        sizes: true
      }
    })
  }

  async create(data: {
    name: string
    slug: string
    description?: string
    shortDescription?: string
    price: number
    discountPrice?: number
    stock?: number
    sku?: string
    brand?: string
    isFeatured?: boolean
    isActive?: boolean
    categoryId: number
    images?: { url: string; alt?: string; isMain?: boolean }[]
    colors?: { name: string; hexCode?: string }[]
    sizes?: { name: string; stock?: number }[]
  }) {
    const { images, colors, sizes, ...productData } = data

    const createData: any = {
      ...productData
    }

    if (images && images.length > 0) {
      createData.images = { createMany: { data: images } }
    }
    if (colors && colors.length > 0) {
      createData.colors = { createMany: { data: colors } }
    }
    if (sizes && sizes.length > 0) {
      createData.sizes = { createMany: { data: sizes } }
    }

    return prismaClient.retailProduct.create({
      data: createData,
      include: {
        category: true,
        images: true,
        colors: true,
        sizes: true
      }
    })
  }

  async update(
    id: number,
    data: Partial<{
      name: string
      slug: string
      description: string
      shortDescription: string
      price: number
      discountPrice: number
      stock: number
      sku: string
      brand: string
      isFeatured: boolean
      isActive: boolean
      categoryId: number
    }>
  ) {
    return prismaClient.retailProduct.update({
      where: { id },
      data,
      include: {
        category: true,
        images: true,
        colors: true,
        sizes: true
      }
    })
  }

  async updateWithRelations(
    id: number,
    data: {
      product?: Partial<{
        name: string
        slug: string
        description: string
        shortDescription: string
        price: number
        discountPrice: number
        stock: number
        sku: string
        brand: string
        isFeatured: boolean
        isActive: boolean
        categoryId: number
      }>
      images?: { url: string; alt?: string; isMain?: boolean }[]
      colors?: { name: string; hexCode?: string }[]
      sizes?: { name: string; stock?: number }[]
    }
  ) {
    return prismaClient.$transaction(async (tx: any) => {
      if (data.images) {
        await tx.retailProductImage.deleteMany({ where: { productId: id } })
      }
      if (data.colors) {
        await tx.retailProductColor.deleteMany({ where: { productId: id } })
      }
      if (data.sizes) {
        await tx.retailProductSize.deleteMany({ where: { productId: id } })
      }

      const updateData: any = { ...data.product }

      if (data.images && data.images.length > 0) {
        updateData.images = { createMany: { data: data.images } }
      }
      if (data.colors && data.colors.length > 0) {
        updateData.colors = { createMany: { data: data.colors } }
      }
      if (data.sizes && data.sizes.length > 0) {
        updateData.sizes = { createMany: { data: data.sizes } }
      }

      return tx.retailProduct.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          images: true,
          colors: true,
          sizes: true
        }
      })
    })
  }

  async delete(id: number) {
    return prismaClient.retailProduct.delete({
      where: { id }
    })
  }

  async existsBySlug(slug: string, excludeId?: number) {
    const where: any = { slug }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    return prismaClient.retailProduct.findFirst({ where })
  }

  async existsBySku(sku: string, excludeId?: number) {
    const where: any = { sku }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    return prismaClient.retailProduct.findFirst({ where })
  }

  async categoryExists(categoryId: number) {
    return prismaClient.retailCategory.findUnique({ where: { id: categoryId } })
  }
}
