import { signToken } from '../utils/jwt.util.js'
import AppError from '../utils/AppError.util.js'
import bcrypt from 'bcrypt'
import { traderRepository } from '../repositories/trader.repository.js'

interface LoginData {
  email: string
  password: string
}
export const traderService = {
  async getMe(id: number) {
    const trader = await traderRepository.findById(id)
    if (!trader) throw new AppError('Trader not found', 404)
    return trader
  },

  async updateMe(id: number, data: { name?: string; address?: string }) {
    return traderRepository.updateById(id, data)
  },

  async login(data: LoginData) {
    const trader = await traderRepository.findByEmail(data.email)
    if (!trader) {
      throw new AppError('Invalid email or password', 401)
    }
    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      trader.password
    )
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401)
    }

    const token = signToken(trader.id.toString(), 'trader')

    return {
      token,
      trader: {
        id: trader.id,
        name: trader.name,
        email: trader.email,
        role: 'trader' as const,
        phone: trader.phone,
      },
    }
  },
}
