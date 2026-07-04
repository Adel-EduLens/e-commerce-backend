import prisma from '../utils/prismaClient.js'

class HelpRepository {
  async findFaqs(options: { categoryId?: string; search?: string }) {
    const where: Record<string, any> = {}

    if (options.search) {
      where.OR = [
        { question: { contains: options.search } },
        { answer: { contains: options.search } },
      ]
    }

    return prisma.frequentlyAskedQuestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
      },
    })
  }

  async findFaqById(id: number) {
    return prisma.frequentlyAskedQuestion.findUnique({
      where: { id },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
      },
    })
  }

  async findCategories() {
    return []
  }
}

export const helpRepository = new HelpRepository()
