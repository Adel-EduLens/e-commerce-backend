import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const productImages = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=60',
];

async function main() {
  console.log('🧹 Cleaning up old wholesale orders and wholesale products...');

  // 1. Delete Wholesale Order Items and Wholesale Orders
  await prisma.wholesaleOrderItem.deleteMany({});
  await prisma.wholesaleOrder.deleteMany({});

  // 2. Find WHOLESALE products
  const wholesaleProducts = await prisma.product.findMany({
    where: {
      productTypes: {
        some: { type: 'WHOLESALE' },
      },
    },
    select: { id: true },
  });

  const wsProductIds = wholesaleProducts.map((p) => p.id);

  if (wsProductIds.length > 0) {
    // Delete product relations for existing wholesale products
    await prisma.productSize.deleteMany({ where: { productId: { in: wsProductIds } } });
    await prisma.productColor.deleteMany({ where: { productId: { in: wsProductIds } } });
    await prisma.productImage.deleteMany({ where: { productId: { in: wsProductIds } } });
    await prisma.productTypeRelation.deleteMany({ where: { productId: { in: wsProductIds } } });
    await prisma.review.deleteMany({ where: { productId: { in: wsProductIds } } });
    await prisma.product.deleteMany({ where: { id: { in: wsProductIds } } });
  }

  console.log('✅ Old wholesale products and orders deleted.');

  // Fetch users and traders
  const user1 = await prisma.user.findFirst({ where: { email: 'user@example.com' } }) ||
    await prisma.user.findFirst();
  const user2 = await prisma.user.findFirst({ where: { email: 'user2@example.com' } }) || user1;
  const user3 = await prisma.user.findFirst({ where: { email: 'user3@example.com' } }) || user1;

  const trader1 = await prisma.trader.findFirst({ where: { id: 1 } }) ||
    await prisma.trader.findFirst();
  const trader3 = await prisma.trader.findFirst({ where: { id: 3 } }) || trader1;

  let wholesaleCategory = await prisma.category.findFirst({ where: { isWholesale: true } });
  if (!wholesaleCategory) {
    wholesaleCategory = await prisma.category.create({
      data: {
        name: 'Wholesale Apparel',
        image: productImages[0],
        isShop: false,
        isWholesale: true,
        isRetail: false,
        appearOnHome: true,
      },
    });
  }

  let wholesaleAccCategory = await prisma.category.findFirst({
    where: { name: { contains: 'Accessories' }, isWholesale: true },
  });
  if (!wholesaleAccCategory) {
    wholesaleAccCategory = wholesaleCategory;
  }

  let brandWholesale = await prisma.brand.findFirst({ where: { name: 'Nasu Wholesale' } });
  if (!brandWholesale) {
    brandWholesale = await prisma.brand.create({ data: { name: 'Nasu Wholesale' } });
  }

  console.log('📦 Creating new Wholesale Products...');

  // Product 1: Bulk Cotton Heavyweight T-Shirt
  const wsTee = await prisma.product.create({
    data: {
      name: 'Bulk Heavyweight Cotton T-Shirts',
      description: 'Premium 240GSM combed cotton blank t-shirts ideal for custom printing and branding.',
      sku: 'WS-TEE-200',
      wholesalePrice: 120,
      stock: 1000,
      rating: 4.9,
      minOrder: 50,
      isBestDeal: true,
      isMostPopular: true,
      traderId: trader1!.id,
      brandId: brandWholesale.id,
      categories: { connect: [{ id: wholesaleCategory.id }] },
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: {
        create: [
          { url: productImages[0], color: 'Black' },
          { url: productImages[1], color: 'White' },
          { url: productImages[4], color: 'Navy' },
        ],
      },
    },
  });

  const blackColor = await prisma.productColor.create({
    data: {
      color: 'Black',
      minOrder: 50,
      stock: 450,
      productId: wsTee.id,
      sizes: {
        create: [
          { size: 'S', quantity: 100, productId: wsTee.id },
          { size: 'M', quantity: 150, productId: wsTee.id },
          { size: 'L', quantity: 120, productId: wsTee.id },
          { size: 'XL', quantity: 80, productId: wsTee.id },
        ],
      },
    },
  });

  const whiteColor = await prisma.productColor.create({
    data: {
      color: 'White',
      minOrder: 50,
      stock: 350,
      productId: wsTee.id,
      sizes: {
        create: [
          { size: 'S', quantity: 80, productId: wsTee.id },
          { size: 'M', quantity: 120, productId: wsTee.id },
          { size: 'L', quantity: 100, productId: wsTee.id },
          { size: 'XL', quantity: 50, productId: wsTee.id },
        ],
      },
    },
  });

  const navyColor = await prisma.productColor.create({
    data: {
      color: 'Navy',
      minOrder: 50,
      stock: 200,
      productId: wsTee.id,
      sizes: {
        create: [
          { size: 'M', quantity: 100, productId: wsTee.id },
          { size: 'L', quantity: 100, productId: wsTee.id },
        ],
      },
    },
  });

  // Product 2: Wholesale Fleece Pullover Hoodie
  const wsHoodie = await prisma.product.create({
    data: {
      name: 'Wholesale Fleece Pullover Hoodie',
      description: '350GSM brushed fleece hoodies built for high durability and warmth.',
      sku: 'WS-HOOD-100',
      wholesalePrice: 350,
      stock: 430,
      rating: 4.8,
      minOrder: 20,
      isMostPopular: true,
      traderId: trader1!.id,
      brandId: brandWholesale.id,
      categories: { connect: [{ id: wholesaleCategory.id }] },
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: {
        create: [
          { url: productImages[1], color: 'Black' },
          { url: productImages[6], color: 'Grey' },
        ],
      },
    },
  });

  await prisma.productColor.create({
    data: {
      color: 'Black',
      minOrder: 20,
      stock: 240,
      productId: wsHoodie.id,
      sizes: {
        create: [
          { size: 'M', quantity: 80, productId: wsHoodie.id },
          { size: 'L', quantity: 100, productId: wsHoodie.id },
          { size: 'XL', quantity: 60, productId: wsHoodie.id },
        ],
      },
    },
  });

  await prisma.productColor.create({
    data: {
      color: 'Grey',
      minOrder: 20,
      stock: 190,
      productId: wsHoodie.id,
      sizes: {
        create: [
          { size: 'S', quantity: 50, productId: wsHoodie.id },
          { size: 'M', quantity: 70, productId: wsHoodie.id },
          { size: 'L', quantity: 70, productId: wsHoodie.id },
        ],
      },
    },
  });

  // Product 3: Wholesale Premium Denim Jacket
  const wsJacket = await prisma.product.create({
    data: {
      name: 'Wholesale Premium Denim Jackets',
      description: 'Durable denim jackets suitable for corporate merchandise or boutique resale.',
      sku: 'WS-JACK-100',
      wholesalePrice: 580,
      stock: 220,
      rating: 4.9,
      minOrder: 15,
      isPremiumCollection: true,
      traderId: trader3!.id,
      brandId: brandWholesale.id,
      categories: { connect: [{ id: wholesaleCategory.id }] },
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: {
        create: [
          { url: productImages[3], color: 'Blue' },
        ],
      },
    },
  });

  await prisma.productColor.create({
    data: {
      color: 'Blue',
      minOrder: 15,
      stock: 220,
      productId: wsJacket.id,
      sizes: {
        create: [
          { size: 'S', quantity: 50, productId: wsJacket.id },
          { size: 'M', quantity: 80, productId: wsJacket.id },
          { size: 'L', quantity: 60, productId: wsJacket.id },
          { size: 'XL', quantity: 30, productId: wsJacket.id },
        ],
      },
    },
  });

  // Product 4: Wholesale Embroidered Snapback Cap Pack
  const wsCap = await prisma.product.create({
    data: {
      name: 'Wholesale Embroidered Caps Pack',
      description: 'Adjustable cotton twill baseball caps for promotional custom embroidery.',
      sku: 'WS-CAP-200',
      wholesalePrice: 85,
      stock: 500,
      rating: 4.7,
      minOrder: 30,
      isBestDeal: true,
      traderId: trader3!.id,
      brandId: brandWholesale.id,
      categories: { connect: [{ id: wholesaleAccCategory.id }] },
      productTypes: { create: [{ type: 'WHOLESALE' }] },
      images: {
        create: [
          { url: productImages[7], color: 'Black' },
        ],
      },
    },
  });

  await prisma.productColor.create({
    data: {
      color: 'Black',
      minOrder: 30,
      stock: 500,
      productId: wsCap.id,
      sizes: {
        create: [
          { size: 'All Sizes', quantity: 500, productId: wsCap.id },
        ],
      },
    },
  });

  console.log('📑 Seeding fresh Wholesale Orders...');

  const pastDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  // Wholesale Order 1
  await prisma.wholesaleOrder.create({
    data: {
      userId: user2!.id,
      firstName: 'Mariam',
      lastName: 'Hassan',
      phone: '+201000000002',
      email: 'user2@example.com',
      country: 'Egypt',
      city: 'Giza',
      area: 'Dokki',
      streetAddress: 'Nile Street, Building 8',
      apartment: '12A',
      subtotal: 22500,
      discount: 0,
      shipping: 50,
      total: 22550,
      status: 'PROCESSING',
      paymentMethod: 'COD',
      createdAt: pastDate(4),
      items: {
        create: [
          {
            productId: wsTee.id,
            title: wsTee.name,
            price: 120,
            quantity: 100,
            size: 'M',
            color: 'Black',
            imageSrc: productImages[0],
          },
          {
            productId: wsHoodie.id,
            title: wsHoodie.name,
            price: 350,
            quantity: 30,
            size: 'L',
            color: 'Grey',
            imageSrc: productImages[6],
          },
        ],
      },
    },
  });

  // Wholesale Order 2
  await prisma.wholesaleOrder.create({
    data: {
      userId: user3!.id,
      firstName: 'Ahmed',
      lastName: 'Khaled',
      phone: '+201000000003',
      email: 'user3@example.com',
      country: 'Egypt',
      city: 'Alexandria',
      area: 'Smouha',
      streetAddress: 'Victor Emanuel St',
      apartment: '2',
      subtotal: 11600,
      discount: 0,
      shipping: 100,
      total: 11700,
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      createdAt: pastDate(10),
      items: {
        create: [
          {
            productId: wsJacket.id,
            title: wsJacket.name,
            price: 580,
            quantity: 20,
            size: 'L',
            color: 'Blue',
            imageSrc: productImages[3],
          },
        ],
      },
    },
  });

  // Wholesale Order 3
  await prisma.wholesaleOrder.create({
    data: {
      userId: user1!.id,
      firstName: 'Nasu Demo',
      lastName: 'User',
      phone: '+201000000001',
      email: 'user@example.com',
      country: 'Egypt',
      city: 'Cairo',
      area: 'Maadi',
      streetAddress: '9th Street, Building 14',
      apartment: '4B',
      subtotal: 4250,
      discount: 0,
      shipping: 50,
      total: 4300,
      status: 'PENDING',
      paymentMethod: 'COD',
      createdAt: pastDate(1),
      items: {
        create: [
          {
            productId: wsCap.id,
            title: wsCap.name,
            price: 85,
            quantity: 50,
            size: 'All Sizes',
            color: 'Black',
            imageSrc: productImages[7],
          },
        ],
      },
    },
  });

  console.log('🎉 Wholesale seed created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
