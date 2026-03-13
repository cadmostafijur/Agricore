import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma v7 configuration file.
 *
 * The database connection URL is supplied here (for Prisma Migrate / CLI)
 * and also passed to the PrismaClient constructor in src/config/database.ts
 * (for runtime queries).
 *
 * See: https://pris.ly/d/config-datasource
 */
export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    url: process.env.DATABASE_URL!,
  },
});
