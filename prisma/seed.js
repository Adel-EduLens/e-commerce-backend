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
];

const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function clearDatabase() {
  console.log('🧹 Clearing existing database records...');
  try { await prisma.collection.deleteMany(); } catch (e) { }
  try { await prisma.influencerSettlementItem.deleteMany(); } catch (e) { }
  try { await prisma.influencerSettlement.deleteMany(); } catch (e) { }
  try { await prisma.influencerCommission.deleteMany(); } catch (e) { }
  try { await prisma.influencerProduct.deleteMany(); } catch (e) { }
  try { await prisma.influencerProfile.deleteMany(); } catch (e) { }
  try { await prisma.traderProfile.deleteMany(); } catch (e) { }

  try { await prisma.orderItem.deleteMany(); } catch (e) { }
  try { await prisma.order.deleteMany(); } catch (e) { }
  try { await prisma.wholesaleOrderItem.deleteMany(); } catch (e) { }
  try { await prisma.wholesaleOrder.deleteMany(); } catch (e) { }
  try { await prisma.retailOrderItem.deleteMany(); } catch (e) { }
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
}

async function main() {
  console.log('🌱 Starting comprehensive full-system database seed...');

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
    ],
  });

  // 2. Admin & Traders
  const [admin, trader1, trader2] = await Promise.all([
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
  ]);

  // 3. Brands
  const [brandOriginals, brandArchive, brandWholesale] = await Promise.all([
    prisma.brand.create({ data: { name: 'Nasu Originals' } }),
    prisma.brand.create({ data: { name: 'Nasu Archive' } }),
    prisma.brand.create({ data: { name: 'Nasu Wholesale' } }),
  ]);

  // 4. Categories
  const [catStreetwear, catEssentials, catWholesaleApparel, catWholesaleAcc, catRetailClothing, catRetailShoes] = await Promise.all([
    prisma.category.create({ data: { name: 'Streetwear', image: productImages[0], isShop: true, isWholesale: false, isRetail: false } }),
    prisma.category.create({ data: { name: 'Essentials', image: productImages[1], isShop: true, isWholesale: false, isRetail: false } }),
    prisma.category.create({ data: { name: 'Wholesale Apparel', image: productImages[0], isShop: false, isWholesale: true, isRetail: false } }),
    prisma.category.create({ data: { name: 'Wholesale Accessories', image: productImages[3], isShop: false, isWholesale: true, isRetail: false } }),
    prisma.category.create({ data: { name: 'Rental Clothing', image: productImages[0], isShop: false, isWholesale: false, isRetail: true } }),
    prisma.category.create({ data: { name: 'Rental Shoes', image: productImages[2], isShop: false, isWholesale: false, isRetail: true } }),
  ]);

  // 5. SHOP Products
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
      categories: { connect: [{ id: catStreetwear.id }] },
      brandId: brandOriginals.id,
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

  // 6. WHOLESALE Products
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
      traderId: trader1.id,
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

  // 7. RETAIL / RENTAL Products
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

  // 9. Coupons
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

  // 10. Reviews
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
    ],
  });

  // 11. Collections
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
      products: { connect: [{ id: blankHoodie.id }] },
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
    ],
  });

  // 13. FAQs
  await prisma.frequentlyAskedQuestion.createMany({
    data: [
      { question: 'What is the minimum order for wholesale?', answer: 'Minimum order quantities depend on the product, starting from 20 items.' },
      { question: 'How do rentals work?', answer: 'Select your item, specify rental dates, and pay a security deposit. Return undamaged by the end date for a full deposit refund.' },
      { question: 'What payment methods are supported?', answer: 'We support Cash on Delivery (COD) and major online credit cards.' },
    ],
  });

  // 14. Orders (SHOP, WHOLESALE, RETAIL)
  console.log('📦 Seeding Orders across SHOP, WHOLESALE, and RETAIL...');

  // --- SHOP Orders ---
  await prisma.order.create({
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
      subtotal: 1250,
      discount: 0,
      shipping: 50,
      total: 1300,
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
      subtotal: 450,
      discount: 0,
      shipping: 50,
      total: 500,
      status: 'PENDING',
      paymentMethod: 'COD',
      createdAt: new Date(),
      items: {
        create: [
          {
            productId: shopTee.id,
            title: shopTee.name,
            price: 450,
            quantity: 1,
            size: 'L',
            color: 'Black',
            imageSrc: productImages[0],
          },
        ],
      },
    },
  });

  await prisma.order.create({
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
      subtotal: 850,
      discount: 0,
      shipping: 50,
      total: 900,
      status: 'CANCELLED',
      paymentMethod: 'CARD',
      createdAt: futureDate(-3),
      items: {
        create: [
          {
            productId: shopHoodie.id,
            title: shopHoodie.name,
            price: 850,
            quantity: 1,
            size: 'S',
            color: 'Off-White',
            imageSrc: productImages[1],
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
      mapAddress: '8 Nile St, Dokki, Giza Governorate, Egypt',
      latitude: '30.0384',
      longitude: '31.2118',
      subtotal: 1700,
      discount: 0,
      shipping: 50,
      total: 1750,
      status: 'PROCESSING',
      paymentMethod: 'CARD',
      createdAt: futureDate(-2),
      items: {
        create: [
          {
            productId: shopTee.id,
            title: shopTee.name,
            price: 450,
            quantity: 1,
            size: 'M',
            color: 'Black',
            imageSrc: productImages[0],
          },
          {
            productId: shopJacket.id,
            title: shopJacket.name,
            price: 1250,
            quantity: 1,
            size: 'M',
            color: 'Olive',
            imageSrc: productImages[5],
          },
        ],
      },
    },
  });

  await prisma.order.create({
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
      mapAddress: 'Building 14, Road 9, Maadi, Cairo Governorate, Egypt',
      latitude: '29.9573',
      longitude: '31.2585',
      subtotal: 2500,
      discount: 0,
      shipping: 50,
      total: 2550,
      status: 'PENDING',
      paymentMethod: 'COD',
      createdAt: new Date(),
      items: {
        create: [
          {
            productId: shopJacket.id,
            title: shopJacket.name,
            price: 1250,
            quantity: 2,
            size: 'L',
            color: 'Olive',
            imageSrc: productImages[5],
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
      subtotal: 1250,
      discount: 250,
      shipping: 50,
      total: 1050,
      couponCode: 'SUMMER20',
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      createdAt: futureDate(-7),
      items: {
        create: [
          {
            productId: shopJacket.id,
            title: shopJacket.name,
            price: 1250,
            quantity: 1,
            size: 'M',
            color: 'Olive',
            imageSrc: productImages[5],
          },
        ],
      },
    },
  });

  await prisma.order.create({
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
      subtotal: 2150,
      discount: 0,
      shipping: 50,
      total: 2200,
      status: 'COMPLETED',
      paymentMethod: 'COD',
      createdAt: futureDate(-10),
      items: {
        create: [
          {
            productId: shopHoodie.id,
            title: shopHoodie.name,
            price: 850,
            quantity: 2,
            size: 'L',
            color: 'Off-White',
            imageSrc: productImages[1],
          },
          {
            productId: shopTee.id,
            title: shopTee.name,
            price: 450,
            quantity: 1,
            size: 'XL',
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
      subtotal: 1250,
      discount: 0,
      shipping: 50,
      total: 1300,
      status: 'CANCELLED',
      paymentMethod: 'COD',
      createdAt: futureDate(-4),
      items: {
        create: [
          {
            productId: shopJacket.id,
            title: shopJacket.name,
            price: 1250,
            quantity: 1,
            size: 'M',
            color: 'Olive',
            imageSrc: productImages[5],
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
      subtotal: 1350,
      discount: 0,
      shipping: 50,
      total: 1400,
      status: 'SHIPPED',
      paymentMethod: 'CARD',
      createdAt: futureDate(-1),
      items: {
        create: [
          {
            productId: shopTee.id,
            title: shopTee.name,
            price: 450,
            quantity: 3,
            size: 'M',
            color: 'Black',
            imageSrc: productImages[0],
          },
        ],
      },
    },
  });

  // --- WHOLESALE Orders ---
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
      subtotal: 13000,
      discount: 0,
      shipping: 50,
      total: 13050,
      status: 'COMPLETED',
      paymentMethod: 'COD',
      createdAt: futureDate(-6),
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
      subtotal: 7500,
      discount: 0,
      shipping: 50,
      total: 7550,
      status: 'PENDING',
      paymentMethod: 'COD',
      createdAt: new Date(),
      items: {
        create: [
          {
            productId: wsTees.id,
            title: wsTees.name,
            price: 150,
            quantity: 50,
            size: 'L',
            color: 'Black',
            imageSrc: productImages[1],
          },
        ],
      },
    },
  });

  await prisma.wholesaleOrder.create({
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
      subtotal: 30000,
      discount: 0,
      shipping: 100,
      total: 30100,
      status: 'SHIPPED',
      paymentMethod: 'CARD',
      createdAt: futureDate(-3),
      items: {
        create: [
          {
            productId: wsTees.id,
            title: wsTees.name,
            price: 150,
            quantity: 200,
            size: 'XL',
            color: 'White',
            imageSrc: productImages[0],
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
      subtotal: 32500,
      discount: 0,
      shipping: 150,
      total: 32650,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      createdAt: futureDate(-12),
      items: {
        create: [
          {
            productId: wsJackets.id,
            title: wsJackets.name,
            price: 650,
            quantity: 50,
            size: 'M',
            color: 'Blue',
            imageSrc: productImages[3],
          },
        ],
      },
    },
  });

  await prisma.wholesaleOrder.create({
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
      subtotal: 28000,
      discount: 0,
      shipping: 100,
      total: 28100,
      status: 'PROCESSING',
      paymentMethod: 'COD',
      createdAt: futureDate(-1),
      items: {
        create: [
          {
            productId: wsTees.id,
            title: wsTees.name,
            price: 150,
            quantity: 100,
            size: 'M',
            color: 'Black',
            imageSrc: productImages[1],
          },
          {
            productId: wsJackets.id,
            title: wsJackets.name,
            price: 650,
            quantity: 20,
            size: 'XL',
            color: 'Blue',
            imageSrc: productImages[3],
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
      subtotal: 12000,
      discount: 0,
      shipping: 50,
      total: 12050,
      status: 'CANCELLED',
      paymentMethod: 'COD',
      createdAt: futureDate(-5),
      items: {
        create: [
          {
            productId: wsTees.id,
            title: wsTees.name,
            price: 150,
            quantity: 80,
            size: 'L',
            color: 'White',
            imageSrc: productImages[0],
          },
        ],
      },
    },
  });

  await prisma.wholesaleOrder.create({
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
      subtotal: 19500,
      discount: 0,
      shipping: 100,
      total: 19600,
      status: 'PENDING',
      paymentMethod: 'COD',
      createdAt: new Date(),
      items: {
        create: [
          {
            productId: wsJackets.id,
            title: wsJackets.name,
            price: 650,
            quantity: 30,
            size: 'L',
            color: 'Blue',
            imageSrc: productImages[3],
          },
        ],
      },
    },
  });

  // --- RETAIL / RENTAL Orders ---
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
      userId: user2.id,
      productId: retailSneakers.id,
      productPrice: 650,
      depositAmount: 250,
      securityDeposit: 900,
      depositPaid: false,
      idCardImage: productImages[2],
      idVerified: false,
      startDate: futureDate(3),
      endDate: futureDate(7),
      returnDate: null,
      status: 'PENDING',
      createdAt: new Date(),
    },
  });

  await prisma.retailOrder.create({
    data: {
      userId: user2.id,
      productId: retailJacket.id,
      productPrice: 900,
      depositAmount: 300,
      securityDeposit: 1200,
      depositPaid: true,
      paymentId: 'PAY-DEMO-RENTAL-02',
      idCardImage: productImages[3],
      idVerified: true,
      startDate: futureDate(-2),
      endDate: futureDate(2),
      returnDate: null,
      status: 'ACTIVE',
      createdAt: futureDate(-4),
    },
  });

  await prisma.retailOrder.create({
    data: {
      userId: user1.id,
      productId: retailSneakers.id,
      productPrice: 650,
      depositAmount: 250,
      securityDeposit: 900,
      depositPaid: true,
      paymentId: 'PAY-DEMO-RENTAL-03',
      idCardImage: productImages[2],
      idVerified: true,
      startDate: futureDate(-10),
      endDate: futureDate(-6),
      returnDate: futureDate(-6),
      status: 'COMPLETED',
      createdAt: futureDate(-12),
    },
  });

  await prisma.retailOrder.create({
    data: {
      userId: user2.id,
      productId: retailJacket.id,
      productPrice: 900,
      depositAmount: 300,
      securityDeposit: 1200,
      depositPaid: false,
      idCardImage: productImages[3],
      idVerified: false,
      startDate: futureDate(5),
      endDate: futureDate(9),
      returnDate: null,
      status: 'CANCELLED',
      createdAt: futureDate(-3),
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
      paymentId: 'PAY-DEMO-RENTAL-04',
      idCardImage: productImages[3],
      idVerified: false,
      startDate: futureDate(4),
      endDate: futureDate(8),
      returnDate: null,
      status: 'PENDING',
      createdAt: new Date(),
    },
  });

  console.log('✅ Full system seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('👤 Users:');
  console.log('   - Customer 1: user@example.com (pass: password123)');
  console.log('   - Customer 2: user2@example.com (pass: password123)');
  console.log('   - Trader 1:   trader@example.com (pass: password123)');
  console.log('   - Trader 2:   trader2@example.com (pass: password123)');
  console.log('   - Admin:      admin@example.com (pass: password123)');
  console.log('📦 Seeded Orders:');
  console.log('   - 11 SHOP Orders (Pending, Processing, Shipped, Completed, Cancelled across multiple traders)');
  console.log('   - 8 WHOLESALE Orders (Pending, Processing, Shipped, Completed, Cancelled)');
  console.log('   - 6 RETAIL/Rental Orders (Pending, Approved, Active, Completed, Cancelled)');
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
