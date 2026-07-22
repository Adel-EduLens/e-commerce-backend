import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development', override: true });
dotenv.config({ path: '.env', override: false });

const prisma = new PrismaClient();

const designs = [
  {
    title: 'Retro Streetwear Design',
    imagePath: '/uploads/votes/2026-07-07_12-24-28-pm_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.png',
    votes: 45,
  },
  {
    title: 'Cyberpunk Neon Tee',
    imagePath: '/uploads/votes/2026-07-08_12-36-35-pm_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.png',
    votes: 82,
  },
  {
    title: 'Futuristic Mech Hoodie',
    imagePath: '/uploads/votes/2026-07-15_11-44-29-am_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.png',
    votes: 120,
  },
  {
    title: 'Nasu Crest Badge',
    imagePath: '/uploads/votes/2026-07-15_11-45-34-am_channels4profile.jpg',
    votes: 31,
  },
  {
    title: 'Vintage Acid Wash Print',
    imagePath: '/uploads/votes/2026-07-19_12-14-57-pm_17c742b2bd7f9c6fdd789a368222b3db7b8a6bc6.png',
    votes: 95,
  },
];

async function main() {
  console.log('🧹 Clearing existing designs...');
  await prisma.design.deleteMany({});

  console.log('🌱 Seeding designs for Design Lab votes...');
  for (const d of designs) {
    const design = await prisma.design.create({
      data: d,
    });
    console.log(`Created design: ${design.title} with ${design.votes} votes`);
  }
  console.log('✅ Vote seeding complete!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
