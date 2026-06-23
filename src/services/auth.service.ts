import { userRepository } from '../repositories/user.repository.js';
import { traderProfileRepository } from '../repositories/traderProfile.repository.js';
import { signToken } from '../utils/jwt.util.js';
import AppError from '../utils/AppError.util.js';

interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  storeName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async signup(data: SignupData) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const newUser = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: (data.role as 'user' | 'trader') || 'user',
      phone: data.phone,
    });

    if (newUser.role === 'trader') {
      await traderProfileRepository.create({
        user: newUser._id,
        storeName: data.storeName || data.name,
      } as any);
    }

    const token = signToken(newUser._id.toString(), newUser.role);

    return {
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    };
  },

  async login(data: LoginData) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordCorrect = await user.comparePassword(data.password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user._id.toString(), user.role);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };
  },
};
