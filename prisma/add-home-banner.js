import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development', override: true });
dotenv.config({ path: '.env', override: false });

const prisma = new PrismaClient();

async function main() {
  const banner = await prisma.shopBanner.create({
    data: {
      title: 'Discover Gen-Z Fashion',
      description: 'Discover fashion that fits your story. step into the spotlight with our latest drop.',
      buttonText: 'Shop now',
      buttonLink: '/products',
      image: '/uploads/products/2026-07-11_11-35-33-am_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.jpg',
      backgroundColor: '#1E1B4B',
      order: 1,
      type: 'home',
    }
  });
  console.log('Successfully created Home Page Banner:', banner);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
