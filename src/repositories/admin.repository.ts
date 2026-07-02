import { Admin } from '../models/Admin.model.js'
import prisma from '../utils/prismaClient.js'

import type { IAdmin } from '../types/admin.type.js'
import { BaseRepository } from './base.repository.js'

class AdminRepository extends BaseRepository<IAdmin> {
  constructor() {
    super(Admin)
  }

  async addQuestion(question: string, answer: string) {
    return prisma.frequentlyAskedQuestion.create({ data: { question, answer } })
  }

  async getQuestions() {
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

  async deleteQuestion(id: number) {
    return prisma.frequentlyAskedQuestion.delete({ where: { id } })
  }

  async updateQuestion(id: number, question: string, answer: string) {
    return prisma.frequentlyAskedQuestion.update({
      where: { id },
      data: { question, answer },
    })
  }

  async findByEmail(email: string) {
    return prisma.admin.findFirst({ where: { email } })
  }
}

export const adminRepository = new AdminRepository()
