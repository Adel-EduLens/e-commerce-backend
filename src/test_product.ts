import prisma from './utils/prismaClient.js';

async function main() {
  const product = await prisma.product.findUnique({
    where: { id: 'cmrg7hww50000gp3cqwubmei0' }
  });
  console.log('Product stock:', product?.stock);
}

main().catch(console.error);
