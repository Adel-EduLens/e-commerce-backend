import prisma from './utils/prismaClient';

async function main() {
  const carts = await prisma.cart.findMany({
    include: {
      items: true,
      user: true,
    }
  });
  for (const c of carts) {
    console.log(`Cart for User: ${c.user?.name || 'anonymous'} (id: ${c.id})`);
    console.log('Items:');
    for (const item of c.items) {
      console.log(`  - Title: ${item.title}, Price: ${item.price}, Qty: ${item.quantity}, Size: ${item.size}, Color: ${item.color}`);
    }
    console.log('-------------------------------');
  }
}

main().catch(console.error);
