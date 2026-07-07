import prisma from '../utils/prismaClient.js'

class TraderRepository {

  findByEmail(email: string) {
    return prisma.trader.findUnique({
      where: {
        email,
      },
    })
  }
}

export const traderRepository = new TraderRepository()
