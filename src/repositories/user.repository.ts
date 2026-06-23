import { User } from '../models/User.model.js';
import type { IUser } from '../types/user.type.js';
import { BaseRepository } from './base.repository.js';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }
}

export const userRepository = new UserRepository();
