import prisma from "../utils/prismaClient.js";
class PrizeRepository {
  async getAll() {
    return prisma.prize.findMany();
  }
}

export const prizeRepository = new PrizeRepository();
