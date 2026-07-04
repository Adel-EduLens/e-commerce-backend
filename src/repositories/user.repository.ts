import prisma from "../utils/prismaClient.js";
import type { SignupData } from "../types/auth.type.js";



class UserRepository {

  async create(data:SignupData) {
    return prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  }
  async findByPhone(phone: string) {
    return prisma.user.findFirst({ where: { phone } });
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    })
  }
}

export const userRepository = new UserRepository();
