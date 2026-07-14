import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear any existing collections to avoid duplicates
  await prisma.collection.deleteMany({});
  console.log('Cleared existing collections.');

  // Find some products to associate with collections
  const products = await prisma.product.findMany({ take: 6 });
  if (products.length === 0) {
    console.log('No products found in DB to associate with collections. Please seed products first.');
    return;
  }

  const p1 = products.slice(0, 2).map(p => p.id);
  const p2 = products.slice(2, 4).map(p => p.id);
  const p3 = products.slice(4, 6).map(p => p.id);

  const collections = [
    {
      name: 'Color of Summer Outfit',
      description: '100+ Collections for your outfit inspirations in this summer',
      image: '/home-page/image 2.png',
      appearOnHome: true,
      productIds: p1,
    },
    {
      name: 'Outdoor Active',
      description: 'Get ready for active and outdoor sports in style.',
      image: '/home-page/image 4.png',
      appearOnHome: true,
      productIds: p2,
    },
    {
      name: 'Casual Comfort',
      description: 'Explore our casual and premium comfortable wears.',
      image: '/home-page/image 5.png',
      appearOnHome: true,
      productIds: p3,
    },
  ];

  for (const c of collections) {
    const { productIds, ...rest } = c;
    const collection = await prisma.collection.create({
      data: {
        ...rest,
        products: {
          connect: productIds.map(id => ({ id }))
        }
      }
    });
    console.log(`Created collection: ${collection.name}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
