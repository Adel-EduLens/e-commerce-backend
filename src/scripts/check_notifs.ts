import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.userNotification.count();
  console.log("Total UserNotifications in DB:", count);
  const sample = await prisma.userNotification.findFirst();
  console.log("Sample:", JSON.stringify(sample, null, 2));
}
main().finally(() => prisma.$disconnect());
