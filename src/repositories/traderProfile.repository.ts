import prisma from "../utils/prismaClient.js";
import type { SignupData } from "../types/auth.type.js";

class TraderProfileRepository {
  async create(data: SignupData) {
    return prisma.trader.create({
      data,
    });
  }
  async findByEmail(email: string) {
    return prisma.trader.findFirst({ where: { email } });
  }
  async findByPhone(phone: string) {
    return prisma.trader.findFirst({ where: { phone } });
  }
  async findById(id: number, select?: any) {
    return prisma.trader.findUnique({ where: { id }, ...(select && { select }) });
  }
}
export const traderProfileRepository = new TraderProfileRepository();



// export const traderProfileRepository = new TraderProfileRepository();
