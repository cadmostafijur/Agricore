import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const adminRole = await prisma.role.upsert({
    where: { role_name: 'Admin' },
    update: {},
    create: { role_name: 'Admin' },
  });

  const customerRole = await prisma.role.upsert({
    where: { role_name: 'Customer' },
    update: {},
    create: { role_name: 'Customer' },
  });

  const hashedPassword = await bcrypt.hash('Admin@123456', 12);

  await prisma.user.upsert({
    where: { email: 'admin@agricore.com' },
    update: {},
    create: {
      name: 'AgriCore Admin',
      email: 'admin@agricore.com',
      password: hashedPassword,
      role_id: adminRole.id,
    },
  });

  const customerPassword = await bcrypt.hash('Customer@123456', 12);

  await prisma.user.upsert({
    where: { email: 'customer@agricore.com' },
    update: {},
    create: {
      name: 'Sample Customer',
      email: 'customer@agricore.com',
      password: customerPassword,
      role_id: customerRole.id,
    },
  });

  console.log('✅ Seed complete');
  console.log('Admin:    admin@agricore.com    / Admin@123456');
  console.log('Customer: customer@agricore.com / Customer@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

