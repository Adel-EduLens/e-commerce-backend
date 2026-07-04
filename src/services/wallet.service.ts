import AppError from '../utils/AppError.util.js'
import prisma from '../utils/prismaClient.js'
import { walletRepository } from '../repositories/wallet.repository.js'

const rewardRate = Number(process.env.REWARD_REDEMPTION_RATE || 100)
const validTransactionTypes = ['CREDIT', 'DEBIT', 'REWARD_EARNED', 'REWARD_REDEEMED', 'REFUND']

export const walletService = {
  async getWallet(userId: number) {
    const wallet = await walletRepository.getOrCreateWallet(userId)

    return {
      balance: wallet.balance,
      rewardPoints: wallet.rewardPoints,
    }
  },

  async getTransactions(userId: number, query: Record<string, any>) {
    const page = Number(query.page || 1)
    const limit = Number(query.limit || 10)
    const type = typeof query.type === 'string' ? query.type.toUpperCase() : undefined

    if (!Number.isInteger(page) || page < 1) {
      throw new AppError('Page must be a positive integer', 400)
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400)
    }

    if (type && !validTransactionTypes.includes(type)) {
      throw new AppError('Invalid transaction type', 400)
    }

    const wallet = await walletRepository.getOrCreateWallet(userId)
    const { transactions, total } = await walletRepository.findTransactionsByWalletId(wallet.id, {
      page,
      limit,
      ...(type ? { type } : {}),
    })

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 0,
      },
    }
  },

  async redeemPoints(userId: number, points: number) {
    if (!Number.isInteger(points) || points < 1) {
      throw new AppError('points must be a positive integer', 400)
    }

    const wallet = await walletRepository.getOrCreateWallet(userId)

    if (wallet.rewardPoints < points) {
      throw new AppError('You do not have enough reward points', 400)
    }

    const convertedAmount = points / rewardRate
    const newBalance = wallet.balance + convertedAmount
    const newRewardPoints = wallet.rewardPoints - points

    return prisma.$transaction(async (tx: any) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance,
          rewardPoints: newRewardPoints,
        },
      })

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REWARD_REDEEMED',
          amount: convertedAmount,
          points,
          description: `Redeemed ${points} reward points`,
          reference: `REDEEM-${wallet.id}`,
        },
      })

      return {
        wallet: updatedWallet,
        transaction,
      }
    })
  },
}
