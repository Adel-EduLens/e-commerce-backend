import type { Response } from 'express'
import type { AuthenticatedRequest } from '../types/user.type.js'
import { asyncHandler } from '../utils/globalErrorHandler.util.js'
import { successResponse } from '../utils/response.util.js'
import { walletService } from '../services/wallet.service.js'

export const getWallet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await walletService.getWallet(Number(req.user?.id))

  successResponse(res, {
    statusCode: 200,
    message: 'Wallet fetched successfully',
    data: result,
  })
})

export const getWalletTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await walletService.getTransactions(Number(req.user?.id), req.query)

  successResponse(res, {
    statusCode: 200,
    message: 'Wallet transactions fetched successfully',
    data: result,
  })
})

export const redeemPoints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await walletService.redeemPoints(Number(req.user?.id), req.body.points)

  successResponse(res, {
    statusCode: 200,
    message: 'Points redeemed successfully',
    data: result,
  })
})
