import { adminRepository } from '../repositories/admin.repository.js';
import { signToken } from '../utils/jwt.util.js';
import AppError from '../utils/AppError.util.js';

interface LoginData {
  email: string;
  password: string;
}

export const adminAuthService = {
  async login(data: LoginData) {
    const admin = await adminRepository.findByEmail(data.email);
    if (!admin) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordCorrect = await admin.comparePassword(data.password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(admin._id.toString(), 'admin');

    return {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin' as const,
        phone: admin.phone,
      },
    };
  },
};
