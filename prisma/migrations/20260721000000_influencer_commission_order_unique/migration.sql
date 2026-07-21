-- Prevent duplicate influencer commission records for the same order.
CREATE UNIQUE INDEX `InfluencerCommission_orderId_key` ON `InfluencerCommission`(`orderId`);
