import { Prisma } from "@prisma/client";
import { prizeRepository } from "../repositories/prize.repository.js";
import AppError from "../utils/AppError.util.js";
export const prizeService = {
  async getPrizes() {
    const prizes = await prizeRepository.getAll();
    return prizes;
  },
  async addPrize(prize: Prisma.PrizeCreateInput) {
    const prizeData = await prizeRepository.create({
      name: prize.name,
      weight: prize.weight,
    });
    return prizeData;
  },
  async deletePrize(id: string) {
    const prize = await prizeRepository.findById(id);
    if (!prize) {
      throw new AppError("Prize not  found", 404);
    }
    const prizeData = await prizeRepository.deleteById(id);
    return prizeData;
  },
  async spinPrize() {
    const prizes = await prizeRepository.getAll();
    if (prizes.length === 0) throw new AppError("No prizes available", 400);
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    for (const prize of prizes) {
      if (random < prize.weight) {
        return prize;
      }
      random -= prize.weight;
    }
    return prizes[prizes.length - 1];
  },
  async findPrizeById(id: string) {
    const prize = await prizeRepository.findById(id);
    return prize;
  },
};
