
import { userRepository } from "../repositories/user.repository.js";
import prisma from "../utils/prismaClient.js";
import { prizeRepository } from "../repositories/prize.repository.js";
export const prizeService = {
    async getPrizes() {
        const prizes = await prizeRepository.getAll();
        return prizes;
    }
}