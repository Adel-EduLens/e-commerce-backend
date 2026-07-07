import prismaClient from '../utils/prismaClient.js'

export class RetailCategoryRepository {
  async findAll() {
    return prismaClient.retailCategory.findMany({
      include: { products: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: number) {
    return prismaClient.retailCategory.findUnique({
      where: { id },
      include: { products: true }
    })
  }

  async findBySlug(slug: string) {
    return prismaClient.retailCategory.findUnique({
      where: { slug },
      include: { products: true }
    })
  }

  async create(data: { name: string; slug: string; description?: string; imageUrl?: string; isActive?: boolean }) {
    return prismaClient.retailCategory.create({
      data,
      include: { products: true }
    })
  }

  async update(id: number, data: Partial<{ name: string; slug: string; description: string; imageUrl: string; isActive: boolean }>) {
    return prismaClient.retailCategory.update({
      where: { id },
      data,
      include: { products: true }
    })
  }

  async delete(id: number) {
    return prismaClient.retailCategory.delete({
      where: { id }
    })
  }

  async existsBySlug(slug: string, excludeId?: number) {
    const where: any = { slug }
    if (excludeId) {
      where.id = { not: excludeId }
    }
    return prismaClient.retailCategory.findFirst({ where })
  }
}
