import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log('Current Cwd:', process.cwd());
const envFile = '.env.development';
console.log('Env file path:', path.resolve(envFile));
console.log('File exists:', fs.existsSync(envFile));

const res = dotenv.config({ path: envFile, override: true });
console.log('Dotenv result:', res);
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);
