import cron from "node-cron";
import { influencerSettlementService } from "../services/influencer.settlement.service.js";

export function startInfluencerCrons() {
  // Every day at midnight: update PENDING commissions to ELIGIBLE (past 15-day hold)
  cron.schedule("0 0 * * *", async () => {
    try {
      const result = await influencerSettlementService.updateEligibleCommissions();
      console.log(`[CRON] Updated ${result.updatedCount} commissions to ELIGIBLE`);
    } catch (error) {
      console.error("[CRON] Failed to update eligible commissions:", error);
    }
  });

  // 1st of every month at 00:30: generate monthly settlements
  cron.schedule("30 0 1 * *", async () => {
    try {
      const result = await influencerSettlementService.generateMonthlySettlements();
      console.log(`[CRON] Generated ${result.settlementsCreated} settlements`);
    } catch (error) {
      console.error("[CRON] Failed to generate settlements:", error);
    }
  });

  console.log("Influencer cron jobs scheduled");
}
