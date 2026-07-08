import prisma from '../utils/prismaClient.js'
import type { SignupData } from '../types/auth.type.js'
import { Request } from 'express'

class UserRepository {
  async create(data: SignupData) {
    return prisma.user.create({
      data,
    })
  }

  async findById(id: number, select?: any) {
    return prisma.user.findUnique({ where: { id }, ...(select && { select }) })
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } })
  }
  async findByPhone(phone: string) {
    return prisma.user.findFirst({ where: { phone } })
  }
  async getVideosByCategorei(id: string) {
    return prisma.helpCenterVideo.findMany({
      where: {
        category: {
          equals: id,
        },
      },
    })
  }
  async getHelpCenterCategories() {
    return prisma.helpCenterCategory.findMany()
  }
}

export const userRepository = new UserRepository()
