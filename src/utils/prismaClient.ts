import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

dotenv.config({ path: path.join(projectRoot, envFile), override: true });
dotenv.config({ path: path.join(projectRoot, '.env'), override: true });

const databaseUrl = process.env.DATABASE_URL || 'mysql://root@localhost:3306/ecommerce_db';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

export default prisma;