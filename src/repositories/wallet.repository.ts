import prisma from '../utils/prismaClient.js'

class WalletRepository {
  async findByUserId(userId: number) {
    return prisma.wallet.findUnique({ where: { userId } })
  }

  async getOrCreateWallet(userId: number) {
    const existingWallet = await this.findByUserId(userId)

    if (existingWallet) {
      return existingWallet
    }

    return prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        rewardPoints: 0,
      },
    })
  }

  async findTransactionsByWalletId(
    walletId: number,
    options: { page: number; limit: number; type?: string }
  ) {
    const where: Record<string, any> = { walletId }

    if (options.type) {
      where.type = options.type
    }

    const [transactions, total] = await prisma.$transaction([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.walletTransaction.count({ where }),
    ])

    return { transactions, total }
  }

  async createTransaction(walletId: number, data: any) {
    return prisma.walletTransaction.create({
      data: {
        walletId,
        ...data,
      },
    })
  }

  async updateWallet(walletId: number, data: Record<string, any>) {
    return prisma.wallet.update({
      where: { id: walletId },
      data,
    })
  }
}

export const walletRepository = new WalletRepository()
