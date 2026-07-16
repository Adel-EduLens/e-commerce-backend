import { influencerRepository } from "../repositories/influencer.repository.js";

export const influencerSettlementService = {
  /**
   * Update all PENDING commissions that are past their 15-day hold to ELIGIBLE.
   */
  async updateEligibleCommissions() {
    const result = await influencerRepository.updatePendingToEligible();
    return { updatedCount: result.count };
  },

  /**
   * Generate monthly settlements for all influencers.
   * Groups all ELIGIBLE (unsettled) commissions by influencer and creates a settlement.
   */
  async generateMonthlySettlements() {
    // First, update eligible commissions
    await this.updateEligibleCommissions();

    // Get all eligible unsettled commissions
    const eligibleCommissions = await influencerRepository.getEligibleCommissions();

    if (eligibleCommissions.length === 0) {
      return { settlementsCreated: 0 };
    }

    // Group by influencerId
    const grouped = new Map<number, typeof eligibleCommissions>();
    for (const commission of eligibleCommissions) {
      const existing = grouped.get(commission.influencerId) || [];
      existing.push(commission);
      grouped.set(commission.influencerId, existing);
    }

    // Calculate period (previous month)
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); // last day of prev month
    const periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1); // 1st of prev month

    let settlementsCreated = 0;

    for (const [influencerId, commissions] of grouped) {
      const totalAmount = commissions.reduce(
        (sum, c) => sum + c.commissionAmount,
        0
      );

      const settlement = await influencerRepository.createSettlement({
        influencerId,
        totalAmount,
        periodStart,
        periodEnd,
      });

      const commissionIds = commissions.map((c) => c.id);
      await influencerRepository.settleCommissions(commissionIds, settlement.id);

      settlementsCreated++;
    }

    return { settlementsCreated };
  },
};
