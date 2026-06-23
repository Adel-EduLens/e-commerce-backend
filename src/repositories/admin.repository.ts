import { Admin } from '../models/Admin.model.js';
import type { IAdmin } from '../types/admin.type.js';
import { BaseRepository } from './base.repository.js';

class AdminRepository extends BaseRepository<IAdmin> {
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }
}

export const adminRepository = new AdminRepository();
