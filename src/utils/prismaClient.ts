import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile, override: true });

const databaseUrl = process.env.DATABASE_URL;

export const prisma = new PrismaClient(
  databaseUrl
    ? {
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      }
    : undefined
);

export default prisma;