import prisma from '../utils/prismaClient.js'

class TraderRepository {

  findByEmail(email: string) {
    return prisma.trader.findUnique({
      where: { email },
    })
  }

  findById(id: number) {
    return prisma.trader.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, createdAt: true },
    })
  }

  updateById(id: number, data: { name?: string; address?: string }) {
    return prisma.trader.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, address: true, role: true, createdAt: true },
    })
  }
}

export const traderRepository = new TraderRepository()
