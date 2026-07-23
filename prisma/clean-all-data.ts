import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all data from system database...');

  try { await prisma.influencerCommission.deleteMany(); } catch (e) { }
  try { await prisma.influencerCouponUsage.deleteMany(); } catch (e) { }
  try { await prisma.influencerCoupon.deleteMany(); } catch (e) { }
  try { await prisma.influencerSettlement.deleteMany(); } catch (e) { }
  try { await prisma.influencer.deleteMany(); } catch (e) { }

  try { await prisma.shippingCity.deleteMany(); } catch (e) { }
  try { await prisma.shippingCountry.deleteMany(); } catch (e) { }

  try { await prisma.collection.deleteMany(); } catch (e) { }
  try { await prisma.orderItem.deleteMany(); } catch (e) { }
  try { await prisma.order.deleteMany(); } catch (e) { }
  try { await prisma.wholesaleOrderItem.deleteMany(); } catch (e) { }
  try { await prisma.wholesaleOrder.deleteMany(); } catch (e) { }
  try { await prisma.retailOrder.deleteMany(); } catch (e) { }

  try { await prisma.cartItem.deleteMany(); } catch (e) { }
  try { await prisma.cart.deleteMany(); } catch (e) { }
  try { await prisma.wishlist.deleteMany(); } catch (e) { }
  try { await prisma.recentlyViewedProduct.deleteMany(); } catch (e) { }
  try { await prisma.recommend.deleteMany(); } catch (e) { }
  try { await prisma.couponUsage.deleteMany(); } catch (e) { }
  try { await prisma.coupon.deleteMany(); } catch (e) { }
  try { await prisma.userNotification.deleteMany(); } catch (e) { }
  try { await prisma.notifyMeSubscription.deleteMany(); } catch (e) { }
  try { await prisma.review.deleteMany(); } catch (e) { }
  try { await prisma.address.deleteMany(); } catch (e) { }

  try { await prisma.productTypeRelation.deleteMany(); } catch (e) { }
  try { await prisma.productMaterial.deleteMany(); } catch (e) { }
  try { await prisma.productImage.deleteMany(); } catch (e) { }
  try { await prisma.productSize.deleteMany(); } catch (e) { }
  try { await prisma.productColor.deleteMany(); } catch (e) { }
  try { await prisma.product.deleteMany(); } catch (e) { }

  try { await prisma.brand.deleteMany(); } catch (e) { }
  try { await prisma.category.deleteMany(); } catch (e) { }
  try { await prisma.shopBanner.deleteMany(); } catch (e) { }
  try { await prisma.prize.deleteMany(); } catch (e) { }
  try { await prisma.helpCenterVideo.deleteMany(); } catch (e) { }
  try { await prisma.helpCenterCategory.deleteMany(); } catch (e) { }
  try { await prisma.frequentlyAskedQuestion.deleteMany(); } catch (e) { }
  try { await prisma.design.deleteMany(); } catch (e) { }

  try { await prisma.trader.deleteMany(); } catch (e) { }
  try { await prisma.admin.deleteMany(); } catch (e) { }
  try { await prisma.user.deleteMany(); } catch (e) { }

  console.log('✨ All system database records have been deleted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
