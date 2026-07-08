import prisma from "../utils/prismaClient.js";
import { Prisma } from "@prisma/client";
class PrizeRepository {
  async getAll() {
    return prisma.prize.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }
  async deleteById(id: string) {
    return prisma.prize.delete({
      where: {
        id,
      },
    });
  }
  async create(data: Prisma.PrizeCreateInput) {
    return prisma.prize.create({
      data,
    });
  }
  async findById(id: string) {
    return prisma.prize.findUnique({
      where: {
        id,
      },
    });
  }
}
export const prizeRepository = new PrizeRepository();
