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
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
];

const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function clearDatabase() {
  console.log('🧹 Clearing all existing database records...');

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

  // categoryToProduct is now an implicit many-to-many — cleared automatically with products
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

  console.log('✅ Old data deleted successfully.');
}

async function main() {
  console.log('🌱 Starting full-system database seeding according to schema.prisma...');

  await clearDatabase();

  const password = await bcrypt.hash('password123', 10);

  // 1. Create Users
  console.log('👥 Creating Users & Addresses...');
  const [user1, user2, user3, user4] = await Promise.all([
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
    prisma.user.create({
      data: {
        id: 3,
        email: 'user3@example.com',
        name: 'Ahmed Khaled',
        password,
        phone: '+201000000003',
        role: 'user',
        status: 'active',
      },
    }),
    prisma.user.create({
      data: {
        id: 4,
        email: 'user4@example.com',
        name: 'Layla Mahmoud',
        password,
        phone: '+201000000004',
        role: 'user',
        status: 'active',
      },
    }),
  ]);

  // Addresses
  await prisma.address.createMany({
    data: [
      {
        userId: user1.id,
        country: 'Egypt',
        city: 'Cairo',
        area: 'Maadi',
        streetAddress: '9th Street, Building 14',
        apartment: '4B',
      },
      {
        userId: user2.id,
        country: 'Egypt',
        city: 'Giza',
        area: 'Dokki',
        streetAddress: 'Nile Street, Building 8',
        apartment: '12A',
      },
      {
        userId: user3.id,
        country: 'Egypt',
        city: 'Alexandria',
        area: 'Smouha',
        streetAddress: 'Victor Emanuel St, Building 3',
        apartment: '2',
      },
      {
        userId: user4.id,
        country: 'Saudi Arabia',
        city: 'Riyadh',
        area: 'Olaya',
        streetAddress: 'King Fahd Road, Villa 45',
        apartment: '1',
      },
    ],
  });

  // 2. Admin & Traders
  console.log('🏢 Creating Admin & Traders...');
  const [admin, trader1, trader2, trader3] = await Promise.all([
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
    prisma.trader.create({
      data: {
        id: 2,
        email: 'trader2@example.com',
        name: 'Urban Threads Trader',
        password,
        phone: '+201000000021',
        address: 'Zamalek, Cairo, Egypt',
      },
    }),
    prisma.trader.create({
      data: {
        id: 3,
        email: 'trader3@example.com',
        name: 'Cairo Denim Works',
        password,
        phone: '+201000000022',
        address: '6th of October City, Egypt',
      },
    }),
  ]);

  // 3. Brands
  console.log('🏷️ Creating Brands & Categories...');
  const [brandOriginals, brandArchive, brandWholesale, brandUrban, brandDenim] = await Promise.all([
    prisma.brand.create({ data: { name: 'Nasu Originals' } }),
    prisma.brand.create({ data: { name: 'Nasu Archive' } }),
    prisma.brand.create({ data: { name: 'Nasu Wholesale' } }),
    prisma.brand.create({ data: { name: 'Urban Streetwear' } }),
    prisma.brand.create({ data: { name: 'Denim Core' } }),
  ]);

  // 4. Categories
  const [catStreetwear, catEssentials, catOuterwear, catFootwear, catWholesaleApparel, catWholesaleAcc, catRetailClothing, catRetailShoes] = await Promise.all([
    prisma.category.create({ data: { name: 'Streetwear', image: productImages[0], isShop: true, isWholesale: false, isRetail: false, appearOnHome: true } }),
    prisma.category.create({ data: { name: 'Essentials', image: productImages[1], isShop: true, isWholesale: false, isRetail: false, appearOnHome: true } }),
    prisma.category.create({ data: { name: 'Outerwear', image: productImages[5], isShop: true, isWholesale: false, isRetail: false, appearOnHome: true } }),
    prisma.category.create({ data: { name: 'Footwear', image: productImages[2], isShop: true, isWholesale: false, isRetail: false, appearOnHome: true } }),
    prisma.category.create({ data: { name: 'Wholesale Apparel', image: productImages[0], isShop: false, isWholesale: true, isRetail: false, appearOnHome: true } }),
    prisma.category.create({ data: { name: 'Wholesale Accessories', image: productImages[3], isShop: false, isWholesale: true, isRetail: false, appearOnHome: true } }),
    prisma.category.create({ data: { name: 'Rental Clothing', image: productImages[0], isShop: false, isWholesale: false, isRetail: true, appearOnHome: true } }),
    prisma.category.create({ data: { name: 'Rental Shoes', image: productImages[2], isShop: false, isWholesale: false, isRetail: true, appearOnHome: true } }),
  ]);

  // 5. SHOP Products
  console.log('🛍️ Creating Shop Products...');
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
      traderId: trader1.id,
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
      traderId: trader1.id,
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

  const shopJacket = await prisma.product.create({
    data: {
      name: 'Urban Bomber Jacket',
      description: 'Water-resistant nylon bomber jacket with ribbed cuffs and utility pockets.',
      sku: 'SHOP-JACK-001',
      shopPrice: 1250,
      stock: 15,
      rating: 4.7,
      isMustHave: false,
      categories: { connect: [{ id: catOuterwear.id }] },
      brandId: brandUrban.id,
      traderId: trader2.id,
      productTypes: { create: [{ type: 'SHOP' }] },
      images: { create: [{ url: productImages[5], color: 'Olive' }] },
      colors: { create: [{ color: 'Olive' }] },
      sizes: {
        create: [
          { size: 'M', quantity: 8, color: 'Olive' },
          { size: 'L', quantity: 7, color: 'Olive' },
        ],
      },
    },
  });

  const shopCargoPants = await prisma.product.create({
    data: {
      name: 'Tactical Cargo Pants',
      description: 'Relaxed-fit cargo pants featuring multi-pockets and adjustable drawstring hems.',
      sku: 'SHOP-CARGO-001',
      shopPrice: 650,
      stock: 25,
      rating: 4.6,
      isMustHave: true,
      categories: { connect: [{ id: catStreetwear.id }] },
      brandId: brandUrban.id,
      traderId: trader2.id,
      productTypes: { create: [{ type: 'SHOP' }] },
      images: { create: [{ url: productImages[4], color: 'Black' }] },
      colors: { create: [{ color: 'Black' }] },
      sizes: {
        create: [
          { size: 'M', quantity: 10, color: 'Black' },
          { size: 'L', quantity: 15, color: 'Black' },
        ],
      },
    },
  });

  const shopSweatshirt = await prisma.product.create({
    data: {
      name: 'Retro Acid-Wash Crewneck',
      description: 'Vintage acid-wash cotton crewneck with embroidered crest detail.',
      sku: 'SHOP-SWEAT-001',
      shopPrice: 750,
      stock: 18,
      rating: 4.8,
      isMustHave: false,
      categories: { connect: [{ id: catEssentials.id }] },
      brandId: brandOriginals.id,
      traderId: trader1.id,
      productTypes: { create: [{ type: 'SHOP' }] },
      images: { create: [{ url: productImages[6], color: 'Grey' }] },
      colors: { create: [{ color: 'Grey' }] },
      sizes: {
        create: [
          { size: 'M', quantity: 8, color: 'Grey' },
          { size: 'L', quantity: 10, color: 'Grey' },
        ],
      },
    },
  });

  // 6. WHOLESALE Products
  console.log('📦 Creating Wholesale Products...');
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
      traderId: trader1.id,
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
      brandId: brandDenim.id,
      traderId: trader3.id,
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: { create: [{ url: productImages[3], color: 'Blue' }] },
    },
  });

  const wsCaps = await prisma.product.create({
    data: {
      name: 'Wholesale Embroidered Caps Pack',
      description: 'Adjustable cotton twill baseball caps for promotional custom embroidery.',
      sku: 'WS-CAP-100',
      wholesalePrice: 90,
      stock: 300,
      minOrder: 50,
      isBestDeal: true,
      categories: { connect: [{ id: catWholesaleAcc.id }] },
      brandId: brandWholesale.id,
      traderId: trader3.id,
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: { create: [{ url: productImages[7], color: 'Black' }] },
    },
  });

  // 7. RETAIL / RENTAL Products
  console.log('👗 Creating Rental / Retail Products...');
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
      traderId: trader1.id,
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
      traderId: trader1.id,
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

  // 8. BLANK Products (for Design Lab)
  console.log('🎨 Creating Blank Products...');
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
      traderId: trader1.id,
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

  const blankTee = await prisma.product.create({
    data: {
      name: 'Customizable Heavy Blank T-Shirt',
      description: 'Premium heavyweight cotton blank t-shirt ideal for DTG and screen printing.',
      sku: 'BLANK-TEE-001',
      blankPrice: 180,
      stock: 200,
      isActive: true,
      categories: { connect: [{ id: catStreetwear.id }] },
      brandId: brandOriginals.id,
      traderId: trader1.id,
      productTypes: { create: [{ type: 'BLANK' }] },
      images: { create: [{ url: productImages[0], color: 'White' }] },
      colors: { create: [{ color: 'White' }] },
      materials: { create: [{ material: '100% Ring Spun Cotton' }] },
      sizes: {
        create: [
          { size: 'M', quantity: 100, color: 'White' },
          { size: 'L', quantity: 100, color: 'White' },
        ],
      },
    },
  });

  // 9. Coupons
  console.log('🎟️ Creating Coupons...');
  const coupon1 = await prisma.coupon.create({
    data: {
      code: 'NASU10',
      discount: 10,
      validUntil: futureDate(30),
      usageLimit: 100,
      traderId: trader1.id,
      categoryId: catStreetwear.id,
    },
  });

  const coupon2 = await prisma.coupon.create({
    data: {
      code: 'SUMMER20',
      discount: 20,
      validUntil: futureDate(15),
      usageLimit: 50,
      traderId: trader1.id,
    },
  });

  const coupon3 = await prisma.coupon.create({
    data: {
      code: 'WELCOME50',
      discount: 15,
      validUntil: futureDate(60),
      usageLimit: 200,
      traderId: trader2.id,
    },
  });

  // 10. Reviews
  console.log('⭐ Creating Product Reviews...');
  await prisma.review.createMany({
    data: [
      {
        userId: user1.id,
        productId: shopTee.id,
        rating: 5,
        comment: 'Super high quality cotton and perfect fit!',
      },
      {
        userId: user2.id,
        productId: shopHoodie.id,
        rating: 5,
        comment: 'Warm, stylish, and fast delivery.',
      },
      {
        userId: user3.id,
        productId: shopJacket.id,
        rating: 4,
        comment: 'Great quality bomber jacket, runs slightly large.',
      },
      {
        userId: user4.id,
        productId: shopCargoPants.id,
        rating: 5,
        comment: 'Pockets are super useful and fit is very comfortable.',
      },
    ],
  });

  // 11. Collections
  console.log('🖼️ Creating Collections & Shop Banners...');
  await prisma.collection.create({
    data: {
      name: 'Color of Summer Outfit',
      description: '100+ Collections for your outfit inspirations in this summer',
      image: productImages[0],
      appearOnHome: true,
      products: { connect: [{ id: shopTee.id }, { id: shopHoodie.id }] },
    },
  });

  await prisma.collection.create({
    data: {
      name: 'Outdoor Active',
      description: 'Get ready for active and outdoor sports in style.',
      image: productImages[2],
      appearOnHome: true,
      products: { connect: [{ id: retailSneakers.id }, { id: shopJacket.id }] },
    },
  });

  await prisma.collection.create({
    data: {
      name: 'Casual Comfort',
      description: 'Explore our casual and premium comfortable wears.',
      image: productImages[1],
      appearOnHome: true,
      products: { connect: [{ id: blankHoodie.id }, { id: shopSweatshirt.id }] },
    },
  });

  // 12. Shop Banners
  await prisma.shopBanner.createMany({
    data: [
      {
        title: 'Discover Gen-Z Fashion',
        description: 'Discover fashion that fits your story. Step into the spotlight with our latest drop.',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        image: productImages[0],
        backgroundColor: '#1E1B4B',
        order: 1,
        type: 'home',
      },
      {
        title: 'Wholesale Direct Supply',
        description: 'Bulk apparel pricing directly from verified traders',
        image: productImages[1],
        buttonText: 'Explore Wholesale',
        buttonLink: '/wholesale',
        backgroundColor: '#0F172A',
        order: 2,
        type: 'home',
      },
      {
        title: 'Rental Wardrobe Collection',
        description: 'Rent premium vintage statement pieces for events and shoots',
        image: productImages[3],
        buttonText: 'Explore Rental',
        buttonLink: '/rental',
        backgroundColor: '#312E81',
        order: 3,
        type: 'rental',
      },
    ],
  });

  // 13. FAQs
  console.log('❓ Creating FAQs...');
  await prisma.frequentlyAskedQuestion.createMany({
    data: [
      { question: 'What is the minimum order for wholesale?', answer: 'Minimum order quantities depend on the product, starting from 20 items.' },
      { question: 'How do rentals work?', answer: 'Select your item, specify rental dates, and pay a security deposit. Return undamaged by the end date for a full deposit refund.' },
      { question: 'What payment methods are supported?', answer: 'We support Cash on Delivery (COD) and major online credit cards.' },
      { question: 'How can I customize blank products?', answer: 'Use our Design Lab to upload artwork and submit custom printing requests.' },
    ],
  });

  // 14. Orders (SHOP, WHOLESALE, RETAIL)
  console.log('📑 Seeding Orders across SHOP, WHOLESALE, and RETAIL...');

  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      firstName: 'Nasu Demo',
      lastName: 'User',
      phone: '+201000000001',
      email: 'user@example.com',
      country: 'Egypt',
      city: 'Cairo',
      area: 'Maadi',
      streetAddress: '9th Street, Building 14',
      apartment: '4B',
      subtotal: 900,
      discount: 90,
      shipping: 50,
      total: 860,
      couponCode: 'NASU10',
      status: 'COMPLETED',
      paymentMethod: 'COD',
      createdAt: futureDate(-5),
      items: {
        create: [
          {
            productId: shopTee.id,
            title: shopTee.name,
            price: 450,
            quantity: 2,
            size: 'M',
            color: 'Black',
            imageSrc: productImages[0],
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user2.id,
      firstName: 'Mariam',
      lastName: 'Hassan',
      phone: '+201000000002',
      email: 'user2@example.com',
      country: 'Egypt',
      city: 'Giza',
      area: 'Dokki',
      streetAddress: 'Nile Street, Building 8',
      apartment: '12A',
      subtotal: 850,
      discount: 0,
      shipping: 50,
      total: 900,
      status: 'PROCESSING',
      paymentMethod: 'CARD',
      createdAt: futureDate(-2),
      items: {
        create: [
          {
            productId: shopHoodie.id,
            title: shopHoodie.name,
            price: 850,
            quantity: 1,
            size: 'M',
            color: 'Off-White',
            imageSrc: productImages[1],
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user3.id,
      firstName: 'Ahmed',
      lastName: 'Khaled',
      phone: '+201000000003',
      email: 'user3@example.com',
      country: 'Egypt',
      city: 'Alexandria',
      area: 'Smouha',
      streetAddress: 'Victor Emanuel St, Building 3',
      apartment: '2',
      subtotal: 1900,
      discount: 0,
      shipping: 60,
      total: 1960,
      status: 'SHIPPED',
      paymentMethod: 'COD',
      createdAt: futureDate(-1),
      items: {
        create: [
          {
            productId: shopJacket.id,
            title: shopJacket.name,
            price: 1250,
            quantity: 1,
            size: 'L',
            color: 'Olive',
            imageSrc: productImages[5],
          },
          {
            productId: shopCargoPants.id,
            title: shopCargoPants.name,
            price: 650,
            quantity: 1,
            size: 'L',
            color: 'Black',
            imageSrc: productImages[4],
          },
        ],
      },
    },
  });

  await prisma.wholesaleOrder.create({
    data: {
      userId: user2.id,
      firstName: 'Mariam',
      lastName: 'Hassan',
      phone: '+201000000002',
      email: 'user2@example.com',
      country: 'Egypt',
      city: 'Giza',
      area: 'Dokki',
      streetAddress: 'Nile Street, Building 8',
      apartment: '12A',
      subtotal: 15000,
      discount: 0,
      shipping: 50,
      total: 15050,
      status: 'PROCESSING',
      paymentMethod: 'COD',
      createdAt: futureDate(-4),
      items: {
        create: [
          {
            productId: wsTees.id,
            title: wsTees.name,
            price: 150,
            quantity: 100,
            size: 'M',
            color: 'White',
            imageSrc: productImages[0],
          },
        ],
      },
    },
  });

  await prisma.wholesaleOrder.create({
    data: {
      userId: user3.id,
      firstName: 'Ahmed',
      lastName: 'Khaled',
      phone: '+201000000003',
      email: 'user3@example.com',
      country: 'Egypt',
      city: 'Alexandria',
      area: 'Smouha',
      streetAddress: 'Victor Emanuel St',
      apartment: '2',
      subtotal: 13000,
      discount: 0,
      shipping: 100,
      total: 13100,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      createdAt: futureDate(-10),
      items: {
        create: [
          {
            productId: wsJackets.id,
            title: wsJackets.name,
            price: 650,
            quantity: 20,
            size: 'L',
            color: 'Blue',
            imageSrc: productImages[3],
          },
        ],
      },
    },
  });

  await prisma.retailOrder.create({
    data: {
      userId: user1.id,
      productId: retailJacket.id,
      productPrice: 900,
      depositAmount: 300,
      securityDeposit: 1200,
      depositPaid: true,
      paymentId: 'PAY-DEMO-RENTAL-01',
      idCardImage: productImages[3],
      idVerified: true,
      startDate: futureDate(1),
      endDate: futureDate(5),
      returnDate: null,
      status: 'APPROVED',
      createdAt: futureDate(-1),
    },
  });

  await prisma.retailOrder.create({
    data: {
      userId: user3.id,
      productId: retailSneakers.id,
      productPrice: 650,
      depositAmount: 250,
      securityDeposit: 900,
      depositPaid: true,
      paymentId: 'PAY-DEMO-RENTAL-02',
      idCardImage: productImages[2],
      idVerified: true,
      startDate: futureDate(-4),
      endDate: futureDate(2),
      returnDate: null,
      status: 'ACTIVE',
      createdAt: futureDate(-5),
    },
  });

  // 15. Designs (Design Lab)
  console.log('🎨 Seeding Designs for Design Lab...');
  await prisma.design.createMany({
    data: [
      {
        title: 'Retro Streetwear Design',
        imagePath: productImages[0],
        votes: 45,
      },
      {
        title: 'Cyberpunk Neon Tee',
        imagePath: productImages[1],
        votes: 82,
      },
      {
        title: 'Futuristic Mech Hoodie',
        imagePath: productImages[2],
        votes: 120,
      },
      {
        title: 'Nasu Crest Badge',
        imagePath: productImages[3],
        votes: 31,
      },
      {
        title: 'Vintage Acid Wash Print',
        imagePath: productImages[4],
        votes: 95,
      },
      {
        title: 'Tokyo Cyber Wave',
        imagePath: productImages[5],
        votes: 110,
      },
    ],
  });

  // 16. Shipping Countries & Cities
  console.log('🌍 Seeding Shipping Countries & Cities...');
  await prisma.shippingCountry.create({
    data: {
      name: 'Egypt',
      code: 'EG',
      cities: {
        create: [
          { name: 'Cairo', shippingCost: 50 },
          { name: 'Giza', shippingCost: 50 },
          { name: 'Alexandria', shippingCost: 60 },
          { name: 'Mansoura', shippingCost: 70 },
          { name: 'Aswan', shippingCost: 100 },
          { name: 'Hurghada', shippingCost: 90 },
        ],
      },
    },
  });

  await prisma.shippingCountry.create({
    data: {
      name: 'Saudi Arabia',
      code: 'SA',
      cities: {
        create: [
          { name: 'Riyadh', shippingCost: 150 },
          { name: 'Jeddah', shippingCost: 150 },
          { name: 'Dammam', shippingCost: 160 },
          { name: 'Mecca', shippingCost: 150 },
        ],
      },
    },
  });

  await prisma.shippingCountry.create({
    data: {
      name: 'United Arab Emirates',
      code: 'AE',
      cities: {
        create: [
          { name: 'Dubai', shippingCost: 180 },
          { name: 'Abu Dhabi', shippingCost: 180 },
          { name: 'Sharjah', shippingCost: 190 },
        ],
      },
    },
  });

  // 17. Influencers & Influencer Coupons & Commissions
  console.log('🌟 Seeding Influencers, Coupons & Commissions...');
  const [influencer1, influencer2] = await Promise.all([
    prisma.influencer.create({
      data: {
        email: 'influencer@example.com',
        name: 'Sara Ahmed',
        password,
        phone: '+201099999999',
        status: 'active',
        role: 'influencer',
      },
    }),
    prisma.influencer.create({
      data: {
        email: 'influencer2@example.com',
        name: 'Omar Style',
        password,
        phone: '+201088888888',
        status: 'active',
        role: 'influencer',
      },
    }),
  ]);

  const influencerCoupon = await prisma.influencerCoupon.create({
    data: {
      code: 'SARA15',
      discountPercent: 15,
      commissionPercent: 10,
      isActive: true,
      influencerId: influencer1.id,
    },
  });

  await prisma.influencerCouponUsage.create({
    data: {
      couponId: influencerCoupon.id,
      userId: user1.id,
      orderId: order1.id,
      orderTotal: 860,
      discountAmount: 90,
      commissionAmount: 86,
    },
  });

  const settlement1 = await prisma.influencerSettlement.create({
    data: {
      influencerId: influencer1.id,
      totalAmount: 500,
      periodStart: futureDate(-30),
      periodEnd: futureDate(-1),
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  await prisma.influencerCommission.create({
    data: {
      influencerId: influencer1.id,
      orderId: order1.id,
      orderTotal: 860,
      commissionPercent: 10,
      commissionAmount: 86,
      status: 'SETTLED',
      eligibleAt: futureDate(-5),
      settlementId: settlement1.id,
    },
  });

  // 18. Prizes (Spin-to-Win)
  console.log('🎰 Seeding Prizes...');
  await prisma.prize.createMany({
    data: [
      { name: '10% OFF Discount Coupon', weight: 50 },
      { name: 'Free Shipping Voucher', weight: 30 },
      { name: '20% OFF Summer Special', weight: 15 },
      { name: 'Grand Prize: Free Hoodie', weight: 5 },
    ],
  });

  // 19. Help Center Categories & Videos
  console.log('🎥 Seeding Help Center...');
  const helpCat1 = await prisma.helpCenterCategory.create({
    data: { name: 'Getting Started' },
  });
  const helpCat2 = await prisma.helpCenterCategory.create({
    data: { name: 'Wholesale Guide' },
  });
  const helpCat3 = await prisma.helpCenterCategory.create({
    data: { name: 'Rental Policy' },
  });

  await prisma.helpCenterVideo.createMany({
    data: [
      { title: 'How to place your first order', category: helpCat1.name, youtubeId: 'dQw4w9WgXcQ' },
      { title: 'Understanding Wholesale bulk discounts', category: helpCat2.name, youtubeId: 'dQw4w9WgXcQ' },
      { title: 'How rental security deposits work', category: helpCat3.name, youtubeId: 'dQw4w9WgXcQ' },
    ],
  });

  // 20. Cart & Wishlist & Recently Viewed & Recommendations
  console.log('🛒 Seeding Cart, Wishlist, Recently Viewed & Notifications...');
  await prisma.cartItem.deleteMany({
    where: { cart: { userId: { in: [user1.id, user2.id] } } },
  });
  await prisma.cart.deleteMany({
    where: { userId: { in: [user1.id, user2.id] } },
  });

  await prisma.cart.create({
    data: {
      userId: user1.id,
      items: {
        create: [
          {
            productId: shopTee.id,
            productType: 'SHOP',
            title: shopTee.name,
            price: 450,
            quantity: 2,
            size: 'M',
            color: 'Black',
            imageSrc: productImages[0],
          },
        ],
      },
    },
  });

  await prisma.cart.create({
    data: {
      userId: user2.id,
      items: {
        create: [
          {
            productId: shopCargoPants.id,
            productType: 'SHOP',
            title: shopCargoPants.name,
            price: 650,
            quantity: 1,
            size: 'L',
            color: 'Black',
            imageSrc: productImages[4],
          },
        ],
      },
    },
  });

  await prisma.wishlist.createMany({
    skipDuplicates: true,
    data: [
      { userId: user1.id, productType: 'SHOP', productId: shopTee.id },
      { userId: user1.id, productType: 'RETAIL', productId: retailJacket.id },
      { userId: user2.id, productType: 'SHOP', productId: shopHoodie.id },
      { userId: user3.id, productType: 'SHOP', productId: shopJacket.id },
    ],
  });

  await prisma.recentlyViewedProduct.createMany({
    skipDuplicates: true,
    data: [
      { userId: user1.id, productType: 'SHOP', productId: shopTee.id },
      { userId: user1.id, productType: 'WHOLESALE', productId: wsTees.id },
      { userId: user2.id, productType: 'SHOP', productId: shopHoodie.id },
      { userId: user3.id, productType: 'RETAIL', productId: retailSneakers.id },
    ],
  });

  await prisma.recommend.createMany({
    skipDuplicates: true,
    data: [
      { userId: user1.id, productId: shopTee.id, categoryId: catStreetwear.id, type: 'VIEW' },
      { userId: user2.id, productId: shopHoodie.id, categoryId: catEssentials.id, type: 'VIEW' },
      { userId: user3.id, productId: shopJacket.id, categoryId: catOuterwear.id, type: 'VIEW' },
    ],
  });

  // 21. User Notifications & Subscriptions
  await prisma.userNotification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Order Status Updated',
        message: 'Your order #1 has been shipped successfully!',
        type: 'order',
        productId: shopTee.id,
        imageUrl: productImages[0],
      },
      {
        userId: user2.id,
        title: 'Special Summer Promo',
        message: 'Use code SUMMER20 for 20% discount on all orders!',
        type: 'promo',
      },
      {
        userId: user3.id,
        title: 'Rental Approved',
        message: 'Your rental request for White Platform Sneakers has been approved!',
        type: 'rental',
        productId: retailSneakers.id,
      },
    ],
  });

  await prisma.notifyMeSubscription.create({
    data: {
      userId: user1.id,
      targetType: 'PRODUCT',
      targetId: shopTee.id,
    },
  });

  console.log('🎉 Full-system database seeding according to schema.prisma completed successfully!');
  console.log('----------------------------------------------------');
  console.log('👤 Accounts created:');
  console.log('   - Customer 1: user@example.com (pass: password123)');
  console.log('   - Customer 2: user2@example.com (pass: password123)');
  console.log('   - Customer 3: user3@example.com (pass: password123)');
  console.log('   - Customer 4: user4@example.com (pass: password123)');
  console.log('   - Trader 1:   trader@example.com (pass: password123)');
  console.log('   - Trader 2:   trader2@example.com (pass: password123)');
  console.log('   - Trader 3:   trader3@example.com (pass: password123)');
  console.log('   - Admin:      admin@example.com (pass: password123)');
  console.log('   - Influencer 1: influencer@example.com (pass: password123)');
  console.log('   - Influencer 2: influencer2@example.com (pass: password123)');
  console.log('📦 Seeded System Data:');
  console.log('   - 10 Products with CategoryToProduct relations');
  console.log('   - SHOP Orders, WHOLESALE Orders & RETAIL Orders');
  console.log('   - 3 Coupons (NASU10, SUMMER20, WELCOME50) & Influencer Coupons (SARA15)');
  console.log('   - Influencer Commissions & Settlements');
  console.log('   - 3 Shipping Countries (Egypt, SA, UAE) with 13 Shipping Cities');
  console.log('   - 6 Designs for Design Lab, 4 Spin-Wheel Prizes, 3 Help Center Categories & Videos');
  console.log('   - User Carts, Wishlists, Recently Viewed, Recommendations & Notifications');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during full system seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
