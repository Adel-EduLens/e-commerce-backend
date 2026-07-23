import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { colors: { some: {} } },
    include: { colors: { include: { sizes: true } } }
  });

  if (products.length === 0) {
    console.log("No products with colors found");
    return;
  }

  const p = products[0];
  console.log("Original Product:", JSON.stringify(p.colors, null, 2));

  // Let's call the repository directly to simulate what happens
  const productRepository = require('./src/repositories/product.repository.ts').default;

  // Let's create a fake update payload based on p
  const payload = {
    colors: p.colors.map(c => ({
      color: c.color,
      minOrder: c.minOrder,
      stock: c.stock,
      sizes: c.sizes.map(s => ({
        size: s.size,
        quantity: c.color.toLowerCase() === 'white' ? s.quantity - 1 : s.quantity
      }))
    }))
  };

  console.log("Payload:", JSON.stringify(payload.colors, null, 2));

  // Note: to run this we'd need to invoke the repo which is a class. Let's just do it directly.
  const ProductRepository = require('./src/repositories/product.repository').default;
  const repo = new ProductRepository();
  
  await repo.update(p.id, payload);

  const updatedP = await prisma.product.findUnique({
    where: { id: p.id },
    include: { colors: { include: { sizes: true } } }
  });
  
  console.log("Updated Product:", JSON.stringify(updatedP.colors, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
