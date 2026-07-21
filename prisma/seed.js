import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development', override: true });
dotenv.config({ path: '.env', override: false });

const prisma = new PrismaClient();

const productImages = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
];

const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function clearDatabase() {
  console.log('Clearing database tables...');
  try { await prisma.collection.deleteMany(); } catch (e) {}
  try { await prisma.influencerSettlementItem.deleteMany(); } catch (e) {}
  try { await prisma.influencerSettlement.deleteMany(); } catch (e) {}
  try { await prisma.influencerCommission.deleteMany(); } catch (e) {}
  try { await prisma.influencerProduct.deleteMany(); } catch (e) {}
  try { await prisma.influencerProfile.deleteMany(); } catch (e) {}
  try { await prisma.traderProfile.deleteMany(); } catch (e) {}

  try { await prisma.orderItem.deleteMany(); } catch (e) {}
  try { await prisma.order.deleteMany(); } catch (e) {}
  try { await prisma.wholesaleOrderItem.deleteMany(); } catch (e) {}
  try { await prisma.wholesaleOrder.deleteMany(); } catch (e) {}
  try { await prisma.retailOrderItem.deleteMany(); } catch (e) {}
  try { await prisma.retailOrder.deleteMany(); } catch (e) {}

  try { await prisma.cartItem.deleteMany(); } catch (e) {}
  try { await prisma.cart.deleteMany(); } catch (e) {}
  try { await prisma.wishlist.deleteMany(); } catch (e) {}
  try { await prisma.recentlyViewedProduct.deleteMany(); } catch (e) {}
  try { await prisma.recommend.deleteMany(); } catch (e) {}
  try { await prisma.couponUsage.deleteMany(); } catch (e) {}
  try { await prisma.coupon.deleteMany(); } catch (e) {}
  try { await prisma.userNotification.deleteMany(); } catch (e) {}
  try { await prisma.notifyMeSubscription.deleteMany(); } catch (e) {}
  try { await prisma.review.deleteMany(); } catch (e) {}
  try { await prisma.address.deleteMany(); } catch (e) {}

  try { await prisma.productTypeRelation.deleteMany(); } catch (e) {}
  try { await prisma.productMaterial.deleteMany(); } catch (e) {}
  try { await prisma.productImage.deleteMany(); } catch (e) {}
  try { await prisma.productSize.deleteMany(); } catch (e) {}
  try { await prisma.productColor.deleteMany(); } catch (e) {}
  try { await prisma.product.deleteMany(); } catch (e) {}

  try { await prisma.brand.deleteMany(); } catch (e) {}
  try { await prisma.category.deleteMany(); } catch (e) {}
  try { await prisma.shopBanner.deleteMany(); } catch (e) {}
  try { await prisma.prize.deleteMany(); } catch (e) {}
  try { await prisma.helpCenterVideo.deleteMany(); } catch (e) {}
  try { await prisma.helpCenterCategory.deleteMany(); } catch (e) {}
  try { await prisma.frequentlyAskedQuestion.deleteMany(); } catch (e) {}
  try { await prisma.design.deleteMany(); } catch (e) {}

  try { await prisma.trader.deleteMany(); } catch (e) {}
  try { await prisma.admin.deleteMany(); } catch (e) {}
  try { await prisma.user.deleteMany(); } catch (e) {}
}

async function main() {
  console.log('🌱 Starting full database seed...');

  await clearDatabase();

  const password = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const [user1, user2] = await Promise.all([
    prisma.user.create({
      data: {
        id: 1,
        email: 'user@example.com',
        name: 'Nasu Demo User',
        password,
        phone: '+201000000001',
        role: 'user',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        id: 2,
        email: 'user2@example.com',
        name: 'Mariam Hassan',
        password,
        phone: '+201000000002',
        role: 'user',
        status: 'active',
      },
    }),
  ]);

  const [admin, trader] = await Promise.all([
    prisma.admin.create({
      data: {
        id: 1,
        email: 'admin@example.com',
        name: 'Nasu Admin',
        password,
        phone: '+201000000010',
      },
    }),
    prisma.trader.create({
      data: {
        id: 1,
        email: 'trader@example.com',
        name: 'Nasu Studio',
        password,
        phone: '+201000000020',
        address: 'Downtown Cairo, Egypt',
      },
    }),
  ]);

  // 2. Create Brands
  const [brandOriginals, brandArchive, brandWholesale] = await Promise.all([
    prisma.brand.create({ data: { name: 'Nasu Originals' } }),
    prisma.brand.create({ data: { name: 'Nasu Archive' } }),
    prisma.brand.create({ data: { name: 'Nasu Wholesale' } }),
  ]);

  // 3. Create Categories
  const [catStreetwear, catEssentials, catWholesaleApparel, catWholesaleAcc, catRetailClothing, catRetailShoes] = await Promise.all([
    prisma.category.create({ data: { name: 'Streetwear', image: productImages[0], isShop: true, isWholesale: false, isRetail: false } }),
    prisma.category.create({ data: { name: 'Essentials', image: productImages[1], isShop: true, isWholesale: false, isRetail: false } }),
    prisma.category.create({ data: { name: 'Wholesale Apparel', image: productImages[0], isShop: false, isWholesale: true, isRetail: false } }),
    prisma.category.create({ data: { name: 'Wholesale Accessories', image: productImages[3], isShop: false, isWholesale: true, isRetail: false } }),
    prisma.category.create({ data: { name: 'Rental Clothing', image: productImages[0], isShop: false, isWholesale: false, isRetail: true } }),
    prisma.category.create({ data: { name: 'Rental Shoes', image: productImages[2], isShop: false, isWholesale: false, isRetail: true } }),
  ]);

  // 4. Create SHOP Products
  const shopTee = await prisma.product.create({
    data: {
      name: 'Oversized Graphic Tee',
      description: 'Heavyweight cotton graphic T-shirt with signature Nasu streetwear print.',
      sku: 'SHOP-TEE-001',
      shopPrice: 450,
      stock: 35,
      rating: 4.8,
      isMustHave: true,
      isFlashDeals: true,
      flashDealPrice: 380,
      flashDealEndsAt: futureDate(7),
      categories: { connect: [{ id: catStreetwear.id }] },
      brandId: brandOriginals.id,
      traderId: trader.id,
      productTypes: { create: [{ type: 'SHOP' }] },
      images: { create: [{ url: productImages[0], color: 'Black' }] },
      colors: { create: [{ color: 'Black' }] },
      sizes: {
        create: [
          { size: 'M', quantity: 15, color: 'Black' },
          { size: 'L', quantity: 12, color: 'Black' },
          { size: 'XL', quantity: 8, color: 'Black' },
        ],
      },
    },
  });

  const shopHoodie = await prisma.product.create({
    data: {
      name: 'Minimalist Heavyweight Hoodie',
      description: 'Ultra-soft fleece hoodie designed for clean layered streetwear looks.',
      sku: 'SHOP-HOOD-001',
      shopPrice: 850,
      stock: 20,
      rating: 4.9,
      isMustHave: true,
      categories: { connect: [{ id: catEssentials.id }] },
      brandId: brandOriginals.id,
      traderId: trader.id,
      productTypes: { create: [{ type: 'SHOP' }] },
      images: { create: [{ url: productImages[1], color: 'Off-White' }] },
      colors: { create: [{ color: 'Off-White' }] },
      sizes: {
        create: [
          { size: 'S', quantity: 5, color: 'Off-White' },
          { size: 'M', quantity: 10, color: 'Off-White' },
          { size: 'L', quantity: 5, color: 'Off-White' },
        ],
      },
    },
  });

  // 5. Create WHOLESALE Products
  const wsTees = await prisma.product.create({
    data: {
      name: 'Bulk Plain Cotton T-Shirts',
      description: 'High-volume wholesale blank t-shirts for printing shops and retail brands.',
      sku: 'WS-TEE-100',
      wholesalePrice: 150,
      stock: 500,
      minOrder: 50,
      isBestDeal: true,
      isMostPopular: true,
      categories: { connect: [{ id: catWholesaleApparel.id }] },
      brandId: brandWholesale.id,
      traderId: trader.id,
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: { create: [{ url: productImages[0], color: 'White' }, { url: productImages[1], color: 'Black' }] },
    },
  });

  await prisma.productColor.create({
    data: {
      color: 'White',
      minOrder: 50,
      stock: 300,
      productId: wsTees.id,
      sizes: {
        create: [
          { size: 'M', quantity: 100, productId: wsTees.id },
          { size: 'L', quantity: 100, productId: wsTees.id },
          { size: 'XL', quantity: 100, productId: wsTees.id },
        ],
      },
    },
  });

  await prisma.productColor.create({
    data: {
      color: 'Black',
      minOrder: 50,
      stock: 200,
      productId: wsTees.id,
      sizes: {
        create: [
          { size: 'M', quantity: 100, productId: wsTees.id },
          { size: 'L', quantity: 100, productId: wsTees.id },
        ],
      },
    },
  });

  const wsJackets = await prisma.product.create({
    data: {
      name: 'Wholesale Premium Denim Jackets',
      description: 'Durable denim jackets suitable for corporate merchandise or boutique resale.',
      sku: 'WS-JACK-100',
      wholesalePrice: 650,
      stock: 150,
      minOrder: 20,
      isPremiumCollection: true,
      categories: { connect: [{ id: catWholesaleApparel.id }] },
      brandId: brandWholesale.id,
      traderId: trader.id,
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: { create: [{ url: productImages[3], color: 'Blue' }] },
    },
  });

  await prisma.productColor.create({
    data: {
      color: 'Blue',
      minOrder: 20,
      stock: 150,
      productId: wsJackets.id,
      sizes: {
        create: [
          { size: 'M', quantity: 50, productId: wsJackets.id },
          { size: 'L', quantity: 50, productId: wsJackets.id },
          { size: 'XL', quantity: 50, productId: wsJackets.id },
        ],
      },
    },
  });

  // 6. Create RETAIL / RENTAL Products
  const retailJacket = await prisma.product.create({
    data: {
      name: 'Vintage Denim Jacket',
      description: 'Statement denim jacket available to rent for shoots, events, and weekend styling.',
      sku: 'RENT-JACKET-001',
      retailPrice: 900,
      stock: 6,
      depositAmount: 300,
      securityDeposit: 1200,
      isFeatured: true,
      termsAndConditions: 'Return clean and undamaged by the selected end date.',
      privacyPolicy: 'ID verification is used only for rental security.',
      categories: { connect: [{ id: catRetailClothing.id }] },
      brandId: brandArchive.id,
      traderId: trader.id,
      productTypes: { create: [{ type: 'RETAIL' }] },
      images: { create: [{ url: productImages[3], color: 'Blue' }] },
      colors: { create: [{ color: 'Blue' }] },
      sizes: {
        create: [
          { size: 'M', quantity: 3, color: 'Blue' },
          { size: 'L', quantity: 3, color: 'Blue' },
        ],
      },
    },
  });

  const retailSneakers = await prisma.product.create({
    data: {
      name: 'White Platform Sneakers',
      description: 'Clean white sneakers for rentals where the look matters more than owning another pair.',
      sku: 'RENT-SHOE-001',
      retailPrice: 650,
      stock: 8,
      depositAmount: 250,
      securityDeposit: 900,
      isFeatured: true,
      termsAndConditions: 'Return with normal wear only.',
      privacyPolicy: 'Rental details are stored for fulfillment.',
      categories: { connect: [{ id: catRetailShoes.id }] },
      brandId: brandArchive.id,
      traderId: trader.id,
      productTypes: { create: [{ type: 'RETAIL' }] },
      images: { create: [{ url: productImages[2], color: 'White' }] },
      colors: { create: [{ color: 'White' }] },
      sizes: {
        create: [
          { size: '41', quantity: 3, color: 'White' },
          { size: '42', quantity: 3, color: 'White' },
          { size: '43', quantity: 2, color: 'White' },
        ],
      },
    },
  });

  // 7. Create BLANK Products (for Design Lab)
  const blankHoodie = await prisma.product.create({
    data: {
      name: 'Customizable Fleece Blank Hoodie',
      description: 'Blank premium fleece hoodie ready for custom prints and designs.',
      sku: 'BLANK-HOOD-001',
      blankPrice: 350,
      stock: 100,
      isActive: true,
      categories: { connect: [{ id: catEssentials.id }] },
      brandId: brandOriginals.id,
      traderId: trader.id,
      productTypes: { create: [{ type: 'BLANK' }] },
      images: { create: [{ url: productImages[1], color: 'Black' }] },
      colors: { create: [{ color: 'Black' }] },
      materials: { create: [{ material: '100% Cotton Fleece' }] },
      sizes: {
        create: [
          { size: 'M', quantity: 50, color: 'Black' },
          { size: 'L', quantity: 50, color: 'Black' },
        ],
      },
    },
  });

  // 8. Create Collections
  await prisma.collection.createMany({
    data: [
      {
        name: 'Color of Summer Outfit',
        description: '100+ Collections for your outfit inspirations in this summer',
        image: productImages[0],
        appearOnHome: true,
      },
      {
        name: 'Outdoor Active',
        description: 'Get ready for active and outdoor sports in style.',
        image: productImages[2],
        appearOnHome: true,
      },
      {
        name: 'Casual Comfort',
        description: 'Explore our casual and premium comfortable wears.',
        image: productImages[1],
        appearOnHome: true,
      },
    ],
  });

  // 9. Create FAQs & Banners
  await prisma.frequentlyAskedQuestion.createMany({
    data: [
      { question: 'What is the minimum order for wholesale?', answer: 'Minimum order quantities depend on the product, starting from 20 items.' },
      { question: 'How do rentals work?', answer: 'Select your item, specify rental dates, and pay a security deposit. Return undamaged by the end date for a full deposit refund.' },
      { question: 'What payment methods are supported?', answer: 'We support Cash on Delivery (COD) and major online credit cards.' },
    ],
  });

  await prisma.shopBanner.createMany({
    data: [
      {
        title: 'New Season Streetwear',
        description: 'Explore the latest oversized hoodies and graphic tees',
        image: productImages[0],
        buttonText: 'Shop Now',
        buttonLink: '/products',
      },
      {
        title: 'Wholesale Direct Supply',
        description: 'Bulk apparel pricing directly from verified traders',
        image: productImages[1],
        buttonText: 'Explore Wholesale',
        buttonLink: '/wholesale',
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('   Users: user@example.com (pass: password123), user2@example.com');
  console.log('   Trader: trader@example.com (pass: password123)');
  console.log('   Admin: admin@example.com (pass: password123)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
