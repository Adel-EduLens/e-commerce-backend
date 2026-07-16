import { influencerRepository } from "../repositories/influencer.repository.js";
import { signToken } from "../utils/jwt.util.js";
import AppError from "../utils/AppError.util.js";
import bcrypt from "bcrypt";

interface LoginData {
  email: string;
  password: string;
}

export const influencerAuthService = {
  async login(data: LoginData) {
    const influencer = await influencerRepository.findByEmail(data.email);
    if (!influencer) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(data.password, influencer.password);
    if (!isPasswordCorrect) {
      throw new AppError("Invalid email or password", 401);
    }

    if (influencer.status === "suspended") {
      throw new AppError("Your account has been suspended", 401);
    }

    const token = signToken(influencer.id.toString(), "influencer");

    return {
      token,
      influencer: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email,
        role: "influencer" as const,
        phone: influencer.phone,
      },
    };
  },
};
