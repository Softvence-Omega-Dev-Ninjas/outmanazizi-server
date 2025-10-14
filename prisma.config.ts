import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'path';
import { PrismaConfig } from 'prisma';

// Explicitly load environment variables
expand(config({ path: path.resolve(process.cwd(), '.env') }));

export default {
  schema: path.join('prisma', 'models'),

  migrations: {
    path: path.join('prisma', 'migrations'),
    // seed: 'tsx prisma/seed.ts', // optional
  },
  views: {
    path: path.join('prisma', 'views'),
  },
  typedSql: {
    path: path.join('prisma', 'queries'),
  },
} satisfies PrismaConfig;