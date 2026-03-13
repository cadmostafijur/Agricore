import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --transpile-only prisma/seed.ts',
  },
  datasource: {
    // Allow `prisma generate` to run in environments where DATABASE_URL
    // is not set (e.g. fresh installs). Migrate/Push still require a real URL.
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/postgres?schema=public',
  },
});

