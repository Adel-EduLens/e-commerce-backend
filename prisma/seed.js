import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development', override: true });
dotenv.config({ path: '.env', override: false });

const prisma = new PrismaClient();

const productImages = [
  '/uploads/products/2026-07-11_11-35-33-am_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.jpg',
  '/uploads/products/2026-07-11_11-46-44-am_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.jpg',
  '/uploads/products/2026-07-11_12-07-30-pm_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.jpg',
  '/uploads/products/2026-07-12_04-32-24-pm_e71ae64c-f658-4dcf-88c2-63fa55cd53dd.jpeg',
];

const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function clearDatabase() {
  await prisma.retailOrder.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.recentlyViewedProduct.deleteMany();
  await prisma.recommend.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.userNotification.deleteMany();
  await prisma.notifyMeSubscription.deleteMany();
  await prisma.retailProductReview.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();

  await prisma.retailProductImage.deleteMany();
  await prisma.retailProductColor.deleteMany();
  await prisma.retailProductSize.deleteMany();
  await prisma.retailProduct.deleteMany();
  await prisma.retailCategory.deleteMany();

  await prisma.wholesaleSize.deleteMany();
  await prisma.wholesaleColor.deleteMany();
  await prisma.wholesaleImage.deleteMany();
  await prisma.wholesale.deleteMany();

  await prisma.productImage.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.product.deleteMany();

  await prisma.blankProductImage.deleteMany();
  await prisma.blankProductColor.deleteMany();
  await prisma.blankProduct.deleteMany();

  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shopBanner.deleteMany();
  await prisma.prize.deleteMany();
  await prisma.helpCenterVideo.deleteMany();
  await prisma.helpCenterCategory.deleteMany();
  await prisma.frequentlyAskedQuestion.deleteMany();
  await prisma.design.deleteMany();

  await prisma.trader.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log('Seeding database...');

  await clearDatabase();

  const password = await bcrypt.hash('password123', 10);

  const [user, secondUser] = await Promise.all([
    prisma.user.create({
      data: {
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
        email: 'admin@example.com',
        name: 'Nasu Admin',
        password,
        phone: '+201000000010',
      },
    }),
    prisma.trader.create({
      data: {
        email: 'trader@example.com',
        name: 'Nasu Studio',
        password,
        phone: '+201000000020',
        address: 'Downtown Cairo, Egypt',
      },
    }),
  ]);

  const [streetwear, essentials, accessories] = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Streetwear',
        image: productImages[0],
        appearOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Essentials',
        image: productImages[1],
        appearOnHome: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        image: productImages[2],
        appearOnHome: true,
      },
    }),
  ]);

  const [nasuBrand, cairoMadeBrand] = await Promise.all([
    prisma.brand.create({ data: { name: 'Nasu' } }),
    prisma.brand.create({ data: { name: 'Cairo Made' } }),
  ]);

  const oversizedHoodie = await prisma.product.create({
    data: {
      name: 'Oversized Graphic Hoodie',
      description:
        'Heavyweight cotton hoodie with a relaxed fit, dropped shoulders, and screen printed Nasu artwork.',
      price: 1450,
      sku: 'NASU-HOODIE-001',
      stock: 42,
      rating: 4.7,
      isMustHave: true,
      isFlashDeals: true,
      flashDealPrice: 1199,
      flashDealEndsAt: futureDate(14),
      traderId: trader.id,
      categoryId: streetwear.id,
      brandId: nasuBrand.id,
      images: {
        createMany: {
          data: [
            { url: productImages[0], color: 'Black' },
            { url: productImages[1], color: 'Sand' },
          ],
        },
      },
      colors: {
        createMany: {
          data: [{ color: 'Black' }, { color: 'Sand' }],
        },
      },
      sizes: {
        createMany: {
          data: [
            { size: 'S', quantity: 8, color: 'Black' },
            { size: 'M', quantity: 14, color: 'Black' },
            { size: 'L', quantity: 12, color: 'Black' },
            { size: 'M', quantity: 8, color: 'Sand' },
          ],
        },
      },
    },
  });

  const essentialTee = await prisma.product.create({
    data: {
      name: 'Boxy Essential T-Shirt',
      description:
        'Soft everyday tee with a boxy silhouette, ribbed neck, and breathable premium cotton.',
      price: 620,
      sku: 'NASU-TEE-001',
      stock: 80,
      rating: 4.5,
      isMustHave: true,
      traderId: trader.id,
      categoryId: essentials.id,
      brandId: cairoMadeBrand.id,
      images: {
        createMany: {
          data: [
            { url: productImages[2], color: 'White' },
            { url: productImages[3], color: 'Navy' },
          ],
        },
      },
      colors: {
        createMany: {
          data: [{ color: 'White' }, { color: 'Navy' }],
        },
      },
      sizes: {
        createMany: {
          data: [
            { size: 'S', quantity: 20, color: 'White' },
            { size: 'M', quantity: 24, color: 'White' },
            { size: 'L', quantity: 18, color: 'Navy' },
            { size: 'XL', quantity: 18, color: 'Navy' },
          ],
        },
      },
    },
  });

  const crossbodyBag = await prisma.product.create({
    data: {
      name: 'Utility Crossbody Bag',
      description:
        'Compact crossbody bag with water resistant fabric, zip pockets, and adjustable strap.',
      price: 780,
      sku: 'NASU-BAG-001',
      stock: 25,
      rating: 4.3,
      traderId: trader.id,
      categoryId: accessories.id,
      brandId: nasuBrand.id,
      images: {
        createMany: {
          data: [{ url: productImages[1], color: 'Olive' }],
        },
      },
      colors: {
        createMany: {
          data: [{ color: 'Olive' }],
        },
      },
      sizes: {
        createMany: {
          data: [{ size: 'One Size', quantity: 25, color: 'Olive' }],
        },
      },
    },
  });

  const wholesalePack = await prisma.wholesale.create({
    data: {
      name: 'Streetwear Starter Pack',
      description:
        'Bulk pack of hoodies and tees for stores launching a streetwear rail.',
      price: 18500,
      minOrder: 5,
      isBestDeal: true,
      isMostPopular: true,
      sku: 'WHOLE-STREET-001',
      stock: 120,
      brand: 'Nasu',
      rating: 4.8,
      traderId: trader.id,
      categoryId: streetwear.id,
      images: {
        createMany: {
          data: [
            { url: productImages[0], color: 'Mixed' },
            { url: productImages[2], color: 'Mixed' },
          ],
        },
      },
      wholesaleColors: {
        create: [
          {
            color: 'Black',
            sizes: { createMany: { data: [{ size: 'M' }, { size: 'L' }] } },
          },
          {
            color: 'White',
            sizes: { createMany: { data: [{ size: 'S' }, { size: 'M' }] } },
          },
        ],
      },
    },
  });

  const [retailClothing, retailShoes, retailAccessories, retailBrand] = await Promise.all([
    prisma.retailCategory.create({
      data: {
        name: 'Rental Clothing',
        image: productImages[0],
      },
    }),
    prisma.retailCategory.create({
      data: {
        name: 'Rental Shoes',
        image: productImages[2],
      },
    }),
    prisma.retailCategory.create({
      data: {
        name: 'Rental Accessories',
        image: productImages[1],
      },
    }),
    prisma.retailBrand.create({
      data: {
        name: 'Nasu Archive',
      },
    }),
  ]);

  const retailJacket = await prisma.retailProduct.create({
    data: {
      name: 'Vintage Denim Jacket',
      description:
        'Statement denim jacket available to rent for shoots, events, and weekend styling.',
      price: 900,
      stock: 6,
      sku: 'RENT-JACKET-001',
      isFeatured: true,
      categoryId: retailClothing.id,
      traderId: trader.id,
      brandId: retailBrand.id,
      depositAmount: 300,
      securityDeposit: 1200,
      termsAndConditions:
        'Return clean and undamaged by the selected end date. Late returns may incur additional fees.',
      privacyPolicy:
        'ID verification is used only for rental security and order support.',
      images: {
        createMany: {
          data: [{ url: productImages[3], color: 'Blue' }],
        },
      },
      colors: {
        createMany: {
          data: [{ color: 'Blue' }],
        },
      },
      sizes: {
        createMany: {
          data: [
            { size: 'M', quantity: 3, color: 'Blue' },
            { size: 'L', quantity: 3, color: 'Blue' },
          ],
        },
      },
    },
  });

  const retailSneakers = await prisma.retailProduct.create({
    data: {
      name: 'White Platform Sneakers',
      description:
        'Clean white sneakers for rentals where the look matters more than owning another pair.',
      price: 650,
      stock: 8,
      sku: 'RENT-SHOE-001',
      isFeatured: true,
      categoryId: retailShoes.id,
      traderId: trader.id,
      brandId: retailBrand.id,
      depositAmount: 250,
      securityDeposit: 900,
      termsAndConditions:
        'Return with normal wear only. Heavy stains or damage may reduce the refundable deposit.',
      privacyPolicy:
        'Rental details are stored for fulfillment and customer service.',
      images: {
        createMany: {
          data: [{ url: productImages[2], color: 'White' }],
        },
      },
      colors: {
        createMany: {
          data: [{ color: 'White' }],
        },
      },
      sizes: {
        createMany: {
          data: [
            { size: '41', quantity: 3, color: 'White' },
            { size: '42', quantity: 3, color: 'White' },
            { size: '43', quantity: 2, color: 'White' },
          ],
        },
      },
    },
  });

  const retailBag = await prisma.retailProduct.create({
    data: {
      name: 'Mini Event Bag',
      description: 'A compact rental bag sized for phone, wallet, keys, and event passes.',
      price: 420,
      stock: 10,
      sku: 'RENT-BAG-001',
      categoryId: retailAccessories.id,
      traderId: trader.id,
      brandId: retailBrand.id,
      depositAmount: 150,
      securityDeposit: 600,
      termsAndConditions: 'Return with all straps and hardware attached.',
      privacyPolicy: 'Order data is used only to process and support rentals.',
      images: {
        createMany: {
          data: [{ url: productImages[1], color: 'Black' }],
        },
      },
      colors: {
        createMany: {
          data: [{ color: 'Black' }],
        },
      },
      sizes: {
        createMany: {
          data: [{ size: 'One Size', quantity: 10, color: 'Black' }],
        },
      },
    },
  });

  await Promise.all([
    prisma.address.create({
      data: {
        country: 'Egypt',
        city: 'Cairo',
        area: 'Zamalek',
        streetAddress: '26 July Street',
        apartment: '12B',
        userId: user.id,
      },
    }),
    prisma.frequentlyAskedQuestion.createMany({
      data: [
        {
          question: 'How long does delivery take?',
          answer: 'Orders inside Cairo usually arrive within 2 to 4 business days.',
        },
        {
          question: 'Can I return a rental item?',
          answer: 'Rental returns are arranged according to the selected rental window.',
        },
        {
          question: 'Do traders support wholesale orders?',
          answer: 'Yes, traders can publish wholesale packs with minimum order quantities.',
        },
      ],
    }),
    prisma.helpCenterCategory.createMany({
      data: [
        { name: 'Orders' },
        { name: 'Rentals' },
        { name: 'Trader Dashboard' },
      ],
    }),
    prisma.prize.createMany({
      data: [
        { name: '10% OFF', weight: 40 },
        { name: 'Free Shipping', weight: 25 },
        { name: 'EGP 100 Wallet Credit', weight: 15 },
        { name: 'Try Again', weight: 20 },
      ],
    }),
    prisma.shopBanner.createMany({
      data: [
        {
          title: 'Summer streetwear drop',
          description: 'Fresh hoodies, tees, and accessories ready for your next outfit.',
          buttonText: 'Shop now',
          buttonLink: '/products',
          image: productImages[0],
          backgroundColor: '#C1121F',
          order: 1,
          type: 'shop',
        },
        {
          title: 'Rent the look',
          description: 'Book statement pieces for shoots and events without buying them.',
          buttonText: 'Browse rentals',
          buttonLink: '/retail',
          image: productImages[3],
          backgroundColor: '#0F766E',
          order: 2,
          type: 'shop',
        },
        {
          title: 'Discover Gen-Z Fashion',
          description: 'Discover fashion that fits your story. step into the spotlight with our latest drop.',
          buttonText: 'Shop now',
          buttonLink: '/products',
          image: productImages[0],
          backgroundColor: '#1E1B4B',
          order: 1,
          type: 'home',
        },
      ],
    }),
    prisma.blankProduct.create({
      data: {
        name: 'Custom Hoodie Blank',
        description: 'Plain heavyweight hoodie ready for custom design uploads.',
        material: 'Cotton fleece',
        pattern: 'Plain',
        price: 700,
        colors: {
          createMany: {
            data: [{ color: 'Black' }, { color: 'Gray' }],
          },
        },
        images: {
          createMany: {
            data: [
              { url: productImages[0], color: 'Black' },
              { url: productImages[1], color: 'Gray' },
            ],
          },
        },
      },
    }),
  ]);

  const [siteCoupon, productCoupon] = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'WELCOME10',
        discount: 10,
        validUntil: futureDate(365),
        usageLimit: 500,
        traderId: trader.id,
        categoryId: streetwear.id,
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'HOODIE15',
        discount: 15,
        validUntil: futureDate(45),
        usageLimit: 100,
        traderId: trader.id,
        productId: oversizedHoodie.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'The hoodie feels premium and the fit is exactly oversized.',
        userId: user.id,
        productId: oversizedHoodie.id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Great everyday tee, soft after washing.',
        userId: secondUser.id,
        productId: essentialTee.id,
      },
    }),
    prisma.retailProductReview.create({
      data: {
        userId: user.id,
        retailProductId: retailJacket.id,
        rating: 5,
      },
    }),
    prisma.notifyMeSubscription.create({
      data: {
        userId: user.id,
        targetType: 'RETAIL_RESTOCK',
        targetId: String(retailBag.id),
      },
    }),
    prisma.userNotification.create({
      data: {
        userId: user.id,
        title: 'Your order is being prepared',
        message: 'We received your demo order and the trader is preparing it now.',
        type: 'order',
        productId: oversizedHoodie.id,
        imageUrl: productImages[0],
      },
    }),
    prisma.couponUsage.create({
      data: {
        couponId: siteCoupon.id,
        userId: secondUser.id,
      },
    }),
  ]);

  await prisma.cart.create({
    data: {
      userId: user.id,
      items: {
        createMany: {
          data: [
            {
              productId: String(retailJacket.id),
              productType: 'RETAIL',
              title: retailJacket.name,
              price: retailJacket.price,
              quantity: 1,
              size: 'M',
              color: 'Blue',
              imageSrc: productImages[3],
            },
            {
              productId: oversizedHoodie.id,
              productType: 'SHOP',
              title: oversizedHoodie.name,
              price: oversizedHoodie.flashDealPrice ?? oversizedHoodie.price,
              quantity: 2,
              size: 'M',
              color: 'Black',
              imageSrc: productImages[0],
            },
          ],
        },
      },
    },
  });

  await Promise.all([
    prisma.wishlist.createMany({
      data: [
        { userId: user.id, productType: 'RETAIL', productId: String(retailSneakers.id) },
        { userId: user.id, productType: 'SHOP', productId: crossbodyBag.id },
        { userId: secondUser.id, productType: 'WHOLESALE', productId: wholesalePack.id },
      ],
    }),
    prisma.recentlyViewedProduct.createMany({
      data: [
        { userId: user.id, productType: 'SHOP', productId: essentialTee.id },
        { userId: user.id, productType: 'RETAIL', productId: String(retailJacket.id) },
        { userId: secondUser.id, productType: 'SHOP', productId: oversizedHoodie.id },
      ],
    }),
    prisma.recommend.createMany({
      data: [
        {
          userId: user.id,
          productId: oversizedHoodie.id,
          categoryId: streetwear.id,
          type: 'view',
        },
        {
          userId: user.id,
          productId: essentialTee.id,
          categoryId: essentials.id,
          type: 'cart',
        },
      ],
    }),
  ]);

  await prisma.order.create({
    data: {
      userId: user.id,
      firstName: 'Nasu',
      lastName: 'User',
      phone: '+201000000001',
      email: user.email,
      country: 'Egypt',
      city: 'Cairo',
      area: 'Zamalek',
      streetAddress: '26 July Street',
      apartment: '12B',
      subtotal: 3018,
      discount: 150,
      shipping: 60,
      total: 2928,
      couponCode: productCoupon.code,
      status: 'PROCESSING',
      paymentMethod: 'COD',
      items: {
        createMany: {
          data: [
            {
              productId: oversizedHoodie.id,
              title: oversizedHoodie.name,
              price: oversizedHoodie.flashDealPrice ?? oversizedHoodie.price,
              quantity: 2,
              size: 'M',
              color: 'Black',
              imageSrc: productImages[0],
            },
            {
              productId: crossbodyBag.id,
              title: crossbodyBag.name,
              price: crossbodyBag.price,
              quantity: 1,
              size: 'One Size',
              color: 'Olive',
              imageSrc: productImages[1],
            },
          ],
        },
      },
    },
  });

  await prisma.retailOrder.create({
    data: {
      userId: user.id,
      productId: retailJacket.id,
      productPrice: retailJacket.price,
      depositAmount: retailJacket.depositAmount,
      securityDeposit: retailJacket.securityDeposit,
      depositPaid: true,
      paymentId: 'seed-payment-001',
      idCardImage: '/uploads/votes/2026-07-07_12-24-28-pm_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.png',
      idVerified: true,
      startDate: futureDate(3),
      endDate: futureDate(7),
      status: 'APPROVED',
    },
  });

  console.log('Database seeded successfully!');
  console.log('Demo credentials:');
  console.log('  user@example.com / password123');
  console.log('  user2@example.com / password123');
  console.log('  trader@example.com / password123');
  console.log('  admin@example.com / password123');
  console.log(
    `Created ${[
      oversizedHoodie,
      essentialTee,
      crossbodyBag,
      wholesalePack,
      retailJacket,
      retailSneakers,
      retailBag,
      admin,
    ].length} primary demo records plus supporting data.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
