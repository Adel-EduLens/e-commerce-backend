import { adminRepository } from '../repositories/admin.repository.js'
import { signToken } from '../utils/jwt.util.js'
import AppError from '../utils/AppError.util.js'
import bcrypt from 'bcrypt'

interface LoginData {
  email: string
  password: string
}

export const adminAuthService = {
  async login(data: LoginData) {
    const admin = await adminRepository.findByEmail(data.email)
    if (!admin) {
      throw new AppError('Invalid email or password', 401)
    }
    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      admin.password
    )
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401)
    }

    const token = signToken(admin.id.toString(), 'admin')

    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin' as const,
        phone: admin.phone,
      },
    }
  },
}
