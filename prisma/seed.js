import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Clear some tables to prevent duplication on multiple runs
  await prisma.address.deleteMany();
  await prisma.wholesale.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.frequentlyAskedQuestion.deleteMany();
  await prisma.retailProduct.deleteMany();
  await prisma.retailCategory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.trader.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });
  console.log(`User created: ${user.email}`);

  // 2. Create Admin
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@example.com',
      name: 'Test Admin',
      password: hashedPassword,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // 3. Create Trader
  const trader = await prisma.trader.create({
    data: {
      email: 'trader@example.com',
      name: 'Test Trader',
      password: hashedPassword,
    },
  });
  console.log(`Trader created: ${trader.email}`);

  // 4. Create Categories
  const category1 = await prisma.category.create({
    data: {
      name: 'Electronics',
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: 'Clothing',
    },
  });
  console.log(`Categories created`);

  // 5. Create Brand
  const brand1 = await prisma.brand.create({
    data: {
      name: 'TechBrand',
    },
  });
  console.log(`Brand created`);

  // 6. Create Product
  const product1 = await prisma.product.create({
    data: {
      name: 'Smartphone X',
      description: 'The latest and greatest smartphone.',
      price: 999.99,
      sku: 'PROD-ELEC-001',
      stock: 50,
      categoryId: category1.id,
      brandId: brand1.id,
      traderId: trader.id,
    },
  });
  console.log(`Product created: ${product1.name}`);

  // 7. Create Retail Category
  const retailCat = await prisma.retailCategory.create({
    data: {
      name: 'Home Appliances',
      slug: 'home-appliances',
    },
  });

  // 8. Create Retail Product
  const retailProduct = await prisma.retailProduct.create({
    data: {
      name: 'Smart Coffee Maker',
      slug: 'smart-coffee-maker',
      price: 150.00,
      stock: 30,
      sku: 'RET-COFF-001',
      categoryId: retailCat.id,
    },
  });
  console.log(`Retail Product created: ${retailProduct.name}`);

  // 9. Create FAQs
  const faq1 = await prisma.frequentlyAskedQuestion.create({
    data: {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day money back guarantee.',
    },
  });
  console.log(`FAQ created: ${faq1.question}`);

  // 10. Create Coupon
  const coupon = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discount: 10,
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      traderId: trader.id,
    },
  });
  console.log(`Coupon created: ${coupon.code}`);

  // 11. Create Wholesale Product
  const wholesale = await prisma.wholesale.create({
    data: {
      name: 'Bulk Smartphone X',
      description: 'Buy smartphones in bulk',
      price: 800.00,
      stock: 500,
      minOrder: 10,
      traderId: trader.id,
      categoryId: category1.id,
      wholesaleColors: {
        create: ['Red', 'Blue'].map((color) => ({
          color,
          sizes: {
            create: ['S', 'L'].map((size) => ({ size })),
          },
        })),
      },
    },
  });
  console.log(`Wholesale created: ${wholesale.name}`);

  // 12. Create Address for User
  const address = await prisma.address.create({
    data: {
      country: 'USA',
      city: 'New York',
      area: 'Manhattan',
      streetAddress: '123 Broadway',
      userId: user.id,
    },
  });
  console.log(`Address created for User`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
