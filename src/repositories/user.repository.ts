import prisma from "../utils/prismaClient.js";
import type { SignupData } from "../types/auth.type.js";



class UserRepository {

  async create(data: SignupData) {
    return prisma.user.create({
      data,
    });
  }

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  }
  async findByPhone(phone: string) {
    return prisma.user.findFirst({ where: { phone } });
  }
}

export const userRepository = new UserRepository();
