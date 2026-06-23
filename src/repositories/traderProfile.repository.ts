import { TraderProfile } from '../models/TraderProfile.model.js';
import type { ITraderProfile } from '../types/trader.type.js';
import { BaseRepository } from './base.repository.js';

class TraderProfileRepository extends BaseRepository<ITraderProfile> {
  constructor() {
    super(TraderProfile);
  }

  async findByUserId(userId: string) {
    return this.findOne({ user: userId as any });
  }
}

export const traderProfileRepository = new TraderProfileRepository();
