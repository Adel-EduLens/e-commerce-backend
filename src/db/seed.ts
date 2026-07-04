import dotenv from 'dotenv';
import prisma from '../utils/prismaClient.js';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await prisma.user.deleteMany({
      where: {
        email: { in: ['trader@nasu.com', 'user@nasu.com'] },
      },
    });
    await prisma.admin.deleteMany({
      where: {
        email: { in: ['admin@nasu.com'] },
      },
    });
    console.log('🧹 Cleaned up existing test accounts.');

    const admin = await prisma.admin.create({
      data: {
        name: 'Nasu Admin',
        email: 'admin@nasu.com',
        password: 'admin123',
        phone: '+1234567890',
      },
    });
    console.log('👑 Admin created successfully:', admin.email);

    const trader = await prisma.user.create({
      data: {
        name: 'Nasu Trader',
        email: 'trader@nasu.com',
        password: 'trader123',
        role: 'trader',
        phone: '+1987654321',
      },
    });
    console.log('📈 Trader created successfully:', trader.email);

    const user = await prisma.user.create({
      data: {
        name: 'Nasu Customer',
        email: 'user@nasu.com',
        password: 'user123',
        role: 'user',
        phone: '+1555555555',
      },
    });
    console.log('👤 Normal user created successfully:', user.email);

    console.log('👋 Seeding process finished.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
