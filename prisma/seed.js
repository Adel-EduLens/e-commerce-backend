import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });
  console.log(`User created: ${user.email}`);

  // 2. Create Admin
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Test Admin',
      password: hashedPassword,
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // 3. Create Trader
  const trader = await prisma.trader.upsert({
    where: { email: 'trader@example.com' },
    update: {},
    create: {
      email: 'trader@example.com',
      name: 'Test Trader',
      password: hashedPassword,
    },
  });
  console.log(`Trader created: ${trader.email}`);

  // 4. Create Categories
  const category1 = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: {
      name: 'Clothing',
    },
  });
  console.log(`Categories created`);

  // 5. Create Brand
  const brand1 = await prisma.brand.upsert({
    where: { name: 'TechBrand' },
    update: {},
    create: {
      name: 'TechBrand',
    },
  });
  console.log(`Brand created`);

  // 6. Create Product
  const product1 = await prisma.product.upsert({
    where: { sku: 'PROD-ELEC-001' },
    update: {},
    create: {
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
  const retailCat = await prisma.retailCategory.upsert({
    where: { slug: 'home-appliances' },
    update: {},
    create: {
      name: 'Home Appliances',
      slug: 'home-appliances',
    },
  });

  // 8. Create Retail Product
  const retailProduct = await prisma.retailProduct.upsert({
    where: { slug: 'smart-coffee-maker' },
    update: {},
    create: {
      name: 'Smart Coffee Maker',
      slug: 'smart-coffee-maker',
      price: 150.00,
      stock: 30,
      sku: 'RET-COFF-001',
      categoryId: retailCat.id,
    },
  });
  console.log(`Retail Product created: ${retailProduct.name}`);

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
