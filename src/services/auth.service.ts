import { userRepository } from "../repositories/user.repository.js";
import { traderProfileRepository } from "../repositories/traderProfile.repository.js";
import { signToken } from "../utils/jwt.util.js";
import AppError from "../utils/AppError.util.js";
import bcrypt from "bcrypt";

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
    let emailExist;
    let phoneExist;
    if (data.role === "trader") {
      emailExist = await traderProfileRepository.findByEmail(data.email);
      phoneExist = data.phone
        ? await traderProfileRepository.findByPhone(data.phone)
        : null;
    } else {
      emailExist = await userRepository.findByEmail(data.email);
      phoneExist = data.phone
        ? await userRepository.findByPhone(data.phone)
        : null;
    }

    if (emailExist) {
      throw new AppError("Email is already registered", 400);
    } else if (phoneExist) {
      throw new AppError("Phone number is already registered", 400);
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    let newUser;
    if (data.role === "trader") {
      newUser = await traderProfileRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: (data.role as "user" | "trader") || "trader",
        phone: data.phone??"",
      });
    } else {
      newUser = await userRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: (data.role as "user" | "trader") || "user",
        phone: data.phone??"",
      });
    }

    const token = signToken(newUser.id.toString(), newUser.role);

    return {
      token,
      user: {
        id: newUser.id,
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
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user.id.toString(), user.role);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };
  },
};
