import { Admin } from '../models/Admin.model.js'
import prisma from '../utils/prismaClient.js'

import type { IAdmin } from '../types/admin.type.js'
import { BaseRepository } from './base.repository.js'

class TraderRepository extends BaseRepository<IAdmin> {
  constructor() {
    super(Admin)
  }

  findByEmail(email: string) {
    return prisma.trader.findUnique({
      where: {
        email,
      },
    })
  }
}

export const traderRepository = new TraderRepository()
