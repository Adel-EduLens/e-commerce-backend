// import { User } from '../models/User.model.js';
import prisma from "../utils/prismaClient.js";

import type { IUser } from "../types/user.type.js";
import { BaseRepository } from "./base.repository.js";

class UserRepository {

  async create(data) {
    return prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({ where: { email } });
  }
}

export const userRepository = new UserRepository();
