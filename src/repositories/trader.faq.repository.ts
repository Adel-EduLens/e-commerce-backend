import prisma from '../utils/prismaClient.js'

class TraderFAQRepository {
  async create(question: string, answer: string) {
    return prisma.frequentlyAskedQuestion.create({
      data: { question, answer },
    })
  }

  async findAll() {
    return prisma.frequentlyAskedQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
      },
    })
  }

  async findById(id: number) {
    return prisma.frequentlyAskedQuestion.findUnique({
      where: { id },
    })
  }

  async update(id: number, question: string, answer: string) {
    return prisma.frequentlyAskedQuestion.update({
      where: { id },
      data: { question, answer },
    })
  }

  async delete(id: number) {
    return prisma.frequentlyAskedQuestion.delete({
      where: { id },
    })
  }
}

export const traderFAQRepository = new TraderFAQRepository()
