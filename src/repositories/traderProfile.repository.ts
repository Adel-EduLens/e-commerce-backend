import prisma from "../utils/prismaClient.js";

class TraderProfileRepository {
  async create(data) {
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
}
export const traderProfileRepository = new TraderProfileRepository();

// import { TraderProfile } from '../models/TraderProfile.model.js';
// import type { ITraderProfile } from '../types/trader.type.js';
// import { BaseRepository } from './base.repository.js';

// class TraderProfileRepository extends BaseRepository<ITraderProfile> {
//   constructor() {
//     super(TraderProfile);
//   }

//   async findByUserId(userId: string) {
//     return this.findOne({ user: userId as any });
//   }
// }

// export const traderProfileRepository = new TraderProfileRepository();
