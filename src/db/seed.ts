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

    // ===== Retail Categories =====
    console.log('🏬 Creating retail categories...');
    const clothingCategory = await prisma.retailCategory.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Apparel and clothing items',
        isActive: true
      }
    });

    const shoesCategory = await prisma.retailCategory.upsert({
      where: { slug: 'shoes' },
      update: {},
      create: {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Footwear and shoes',
        isActive: true
      }
    });

    const accessoriesCategory = await prisma.retailCategory.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Fashion accessories',
        isActive: true
      }
    });
    console.log('✅ Retail categories created');

    // ===== Retail Products =====
    console.log('🛍️ Creating retail products...');

    // Delete existing retail products first
    await prisma.retailProduct.deleteMany({
      where: {
        slug: { in: ['retail-hoodie', 'retail-sneakers', 'retail-cap'] }
      }
    });

    const hoodieProduct = await prisma.retailProduct.create({
      data: {
        name: 'Retail Hoodie',
        slug: 'retail-hoodie',
        description: 'Premium cotton comfortable hoodie perfect for casual wear',
        shortDescription: 'Comfortable everyday hoodie',
        price: 850,
        discountPrice: 699,
        stock: 25,
        sku: 'RH-001',
        brand: 'Nasu',
        isFeatured: true,
        isActive: true,
        categoryId: clothingCategory.id,
        images: {
          createMany: {
            data: [
              {
                url: 'https://example.com/hoodie-1.jpg',
                alt: 'Black hoodie front',
                isMain: true
              },
              {
                url: 'https://example.com/hoodie-2.jpg',
                alt: 'Black hoodie back',
                isMain: false
              }
            ]
          }
        },
        colors: {
          createMany: {
            data: [
              { name: 'Black', hexCode: '#000000' },
              { name: 'Gray', hexCode: '#808080' }
            ]
          }
        },
        sizes: {
          createMany: {
            data: [
              { name: 'S', stock: 5 },
              { name: 'M', stock: 10 },
              { name: 'L', stock: 10 }
            ]
          }
        }
      }
    });
    console.log('✅ Hoodie product created');

    const sneakersProduct = await prisma.retailProduct.create({
      data: {
        name: 'Retail Sneakers',
        slug: 'retail-sneakers',
        description: 'High-quality running sneakers with comfortable fit',
        shortDescription: 'Premium running shoes',
        price: 1200,
        discountPrice: 999,
        stock: 30,
        sku: 'RS-001',
        brand: 'Nasu',
        isFeatured: true,
        isActive: true,
        categoryId: shoesCategory.id,
        images: {
          createMany: {
            data: [
              {
                url: 'https://example.com/sneaker-1.jpg',
                alt: 'Sneakers side view',
                isMain: true
              },
              {
                url: 'https://example.com/sneaker-2.jpg',
                alt: 'Sneakers top view',
                isMain: false
              }
            ]
          }
        },
        colors: {
          createMany: {
            data: [
              { name: 'White', hexCode: '#FFFFFF' },
              { name: 'Black', hexCode: '#000000' },
              { name: 'Navy', hexCode: '#000080' }
            ]
          }
        },
        sizes: {
          createMany: {
            data: [
              { name: '6', stock: 8 },
              { name: '7', stock: 12 },
              { name: '8', stock: 10 }
            ]
          }
        }
      }
    });
    console.log('✅ Sneakers product created');

    const capProduct = await prisma.retailProduct.create({
      data: {
        name: 'Retail Cap',
        slug: 'retail-cap',
        description: 'Stylish baseball cap with UV protection',
        shortDescription: 'Trendy baseball cap',
        price: 350,
        discountPrice: 249,
        stock: 50,
        sku: 'RC-001',
        brand: 'Nasu',
        isFeatured: false,
        isActive: true,
        categoryId: accessoriesCategory.id,
        images: {
          createMany: {
            data: [
              {
                url: 'https://example.com/cap-1.jpg',
                alt: 'Cap front view',
                isMain: true
              }
            ]
          }
        },
        colors: {
          createMany: {
            data: [
              { name: 'Red', hexCode: '#FF0000' },
              { name: 'Blue', hexCode: '#0000FF' }
            ]
          }
        },
        sizes: {
          createMany: {
            data: [{ name: 'One Size', stock: 50 }]
          }
        }
      }
    });
    console.log('✅ Cap product created');

    console.log('👋 Seeding process finished.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
