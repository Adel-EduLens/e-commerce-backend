import dotenv from 'dotenv';
import { connectDB, mongoose } from './db.connection.js';
import { userRepository } from '../repositories/user.repository.js';
import { adminRepository } from '../repositories/admin.repository.js';
import { traderProfileRepository } from '../repositories/traderProfile.repository.js';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nasu';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await connectDB(MONGODB_URI);

    // Clean up existing test data
    await userRepository.deleteMany({ email: { $in: ['trader@nasu.com', 'user@nasu.com'] } });
    await adminRepository.deleteMany({ email: { $in: ['admin@nasu.com'] } });
    await traderProfileRepository.deleteMany({});
    console.log('🧹 Cleaned up existing test accounts.');

    // Create admin
    const admin = await adminRepository.create({
      name: 'Nasu Admin',
      email: 'admin@nasu.com',
      password: 'admin123',
      phone: '+1234567890',
    });
    console.log('👑 Admin created successfully:', admin.email);

    // Create trader
    const trader = await userRepository.create({
      name: 'Nasu Trader',
      email: 'trader@nasu.com',
      password: 'trader123',
      role: 'trader',
      phone: '+1987654321',
    });

    await traderProfileRepository.create({
      user: trader._id,
      storeName: 'Nasu Store',
      storeDescription: 'A test trader store',
    } as any);
    console.log('📈 Trader created successfully:', trader.email);

    // Create regular user
    const user = await userRepository.create({
      name: 'Nasu Customer',
      email: 'user@nasu.com',
      password: 'user123',
      role: 'user',
      phone: '+1555555555',
    });
    console.log('👤 Normal user created successfully:', user.email);

    await mongoose.connection.close();
    console.log('👋 Seeding process finished, connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
