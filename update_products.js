import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  for (let i = 0; i < products.length; i++) {
    await prisma.product.update({
      where: { id: products[i].id },
      data: {
        isMustHave: i % 2 === 0 || i === 0, 
        isFlashDeals: i % 2 !== 0 || i === 0,
        flashDealPrice: products[i].price * 0.8,
        flashDealEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
      }
    });
  }
  console.log('Products updated successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
