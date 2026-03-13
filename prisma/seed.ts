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

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── Roles ──────────────────────────────────────────────────────
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

  // ── Admin user ─────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agricore.com' },
    update: {},
    create: {
      name: 'AgriCore Admin',
      email: 'admin@agricore.com',
      password: adminPassword,
      role_id: adminRole.id,
    },
  });

  // ── Farmer users ───────────────────────────────────────────────
  const farmerPassword = await bcrypt.hash('Customer@123456', 12);

  const farmer1 = await prisma.user.upsert({
    where: { email: 'farmer1@agricore.com' },
    update: {},
    create: {
      name: 'Rahim Uddin',
      email: 'farmer1@agricore.com',
      password: farmerPassword,
      role_id: customerRole.id,
    },
  });

  const farmer2 = await prisma.user.upsert({
    where: { email: 'farmer2@agricore.com' },
    update: {},
    create: {
      name: 'Karim Hossain',
      email: 'farmer2@agricore.com',
      password: farmerPassword,
      role_id: customerRole.id,
    },
  });

  const farmer3 = await prisma.user.upsert({
    where: { email: 'farmer3@agricore.com' },
    update: {},
    create: {
      name: 'Fatema Begum',
      email: 'farmer3@agricore.com',
      password: farmerPassword,
      role_id: customerRole.id,
    },
  });

  // ── Fields ─────────────────────────────────────────────────────
  const fields = await Promise.all([
    prisma.field.upsert({ where: { id: 1 }, update: {}, create: { name: 'North Paddy', district: 'Sylhet', area_ha: 2.5, user_id: farmer1.id } }),
    prisma.field.upsert({ where: { id: 2 }, update: {}, create: { name: 'South Farm', district: 'Chittagong', area_ha: 1.8, user_id: farmer1.id } }),
    prisma.field.upsert({ where: { id: 3 }, update: {}, create: { name: 'River Plot', district: 'Dhaka', area_ha: 3.2, user_id: farmer2.id } }),
    prisma.field.upsert({ where: { id: 4 }, update: {}, create: { name: 'Hill Garden', district: 'Rajshahi', area_ha: 0.9, user_id: farmer3.id } }),
  ]);

  // ── Crops ──────────────────────────────────────────────────────
  await Promise.all([
    prisma.crop.upsert({ where: { id: 1 }, update: {}, create: { name: 'Aman Rice', field_id: fields[0].id, status: 'Active' } }),
    prisma.crop.upsert({ where: { id: 2 }, update: {}, create: { name: 'Boro Rice', field_id: fields[0].id, status: 'Active' } }),
    prisma.crop.upsert({ where: { id: 3 }, update: {}, create: { name: 'Tomato', field_id: fields[1].id, status: 'Active' } }),
    prisma.crop.upsert({ where: { id: 4 }, update: {}, create: { name: 'Wheat', field_id: fields[2].id, status: 'Active' } }),
    prisma.crop.upsert({ where: { id: 5 }, update: {}, create: { name: 'Mustard', field_id: fields[3].id, status: 'Harvested' } }),
  ]);

  // ── Crop Reports ───────────────────────────────────────────────
  const reportData = [
    { title: 'Brown Planthopper Infestation', crop_name: 'Aman Rice', district: 'Sylhet', description: 'Severe brown planthopper attack observed in northeast section.', type: 'Pest', status: 'Approved', user_id: farmer1.id, field_id: fields[0].id, created_at: daysAgo(0) },
    { title: 'Leaf Blight on Tomato', crop_name: 'Tomato', district: 'Chittagong', description: 'Early blight symptoms on lower leaves. Approx 20% affected.', type: 'Disease', status: 'Pending', user_id: farmer1.id, field_id: fields[1].id, created_at: daysAgo(1) },
    { title: 'Flood Damage Assessment', crop_name: 'Wheat', district: 'Dhaka', description: 'Flash flood damaged approximately 40% of standing wheat crop.', type: 'Weather', status: 'Approved', user_id: farmer2.id, field_id: fields[2].id, created_at: daysAgo(1) },
    { title: 'Aphid Attack on Mustard', crop_name: 'Mustard', district: 'Rajshahi', description: 'Heavy aphid colonisation on mustard plants in late growth stage.', type: 'Pest', status: 'Rejected', user_id: farmer3.id, field_id: fields[3].id, created_at: daysAgo(2) },
    { title: 'Rice Stem Borer', crop_name: 'Boro Rice', district: 'Sylhet', description: 'Deadheart symptoms in 15% of crop. Stem borer confirmed.', type: 'Pest', status: 'Pending', user_id: farmer1.id, field_id: fields[0].id, created_at: daysAgo(2) },
    { title: 'Drought Stress Report', crop_name: 'Tomato', district: 'Chittagong', description: 'Prolonged dry spell causing wilting and blossom drop.', type: 'Weather', status: 'Approved', user_id: farmer1.id, field_id: fields[1].id, created_at: daysAgo(3) },
    { title: 'General Crop Health Check', crop_name: 'Aman Rice', district: 'Sylhet', description: 'Routine health inspection — all good, minor nutrient deficiency.', type: 'General', status: 'Approved', user_id: farmer2.id, field_id: fields[2].id, created_at: daysAgo(4) },
    { title: 'Harvest Yield Report', crop_name: 'Mustard', district: 'Rajshahi', description: 'Harvest completed. Yield approximately 1.2 ton/ha.', type: 'Harvest', status: 'Approved', user_id: farmer3.id, created_at: daysAgo(5) },
    { title: 'Soil pH Imbalance', crop_name: 'Wheat', district: 'Dhaka', description: 'Soil test shows pH 4.8 — too acidic. Lime application needed.', type: 'Soil', status: 'Pending', user_id: farmer2.id, field_id: fields[2].id, created_at: daysAgo(6) },
    { title: 'Late Blight Alert', crop_name: 'Tomato', district: 'Chittagong', description: 'Late blight confirmed. Immediate fungicide intervention needed.', type: 'Disease', status: 'Pending', user_id: farmer1.id, field_id: fields[1].id, created_at: daysAgo(0) },
  ];

  for (const r of reportData) {
    await prisma.cropReport.create({
      data: {
        title: r.title,
        crop_name: r.crop_name,
        district: r.district,
        description: r.description,
        type: r.type,
        status: r.status,
        user_id: r.user_id,
        field_id: r.field_id ?? null,
        created_at: r.created_at,
        updated_at: r.created_at,
        reviewed_at: r.status !== 'Pending' ? r.created_at : null,
      },
    });
  }

  // ── Notifications ──────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { user_id: farmer1.id, title: 'Report Approved', message: 'Your report "Brown Planthopper Infestation" has been approved.', type: 'success', read: false },
      { user_id: farmer1.id, title: 'Report Rejected', message: 'Your report "Aphid Attack on Mustard" was rejected. Please review and resubmit.', type: 'error', read: true },
      { user_id: farmer1.id, title: 'Welcome to AgriCore', message: 'Your account is all set up. Start by adding your fields and crops.', type: 'info', read: true },
      { user_id: farmer2.id, title: 'Report Approved', message: 'Your report "Flood Damage Assessment" has been approved.', type: 'success', read: false },
      { user_id: farmer3.id, title: 'System Update', message: 'AgriCore has been updated with new features. Check out the dashboard!', type: 'info', read: false },
    ],
  });

  // ── Activity Logs ──────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { user_id: farmer1.id, action: 'Submitted crop report', entity: 'CropReport', entity_id: 1, created_at: daysAgo(0) },
      { user_id: admin.id,   action: 'Approved report',        entity: 'CropReport', entity_id: 1, created_at: daysAgo(0) },
      { user_id: farmer2.id, action: 'Submitted crop report', entity: 'CropReport', entity_id: 3, created_at: daysAgo(1) },
      { user_id: farmer1.id, action: 'Added new field',        entity: 'Field',      entity_id: 2, created_at: daysAgo(1) },
      { user_id: admin.id,   action: 'Rejected report',        entity: 'CropReport', entity_id: 4, created_at: daysAgo(2) },
      { user_id: farmer3.id, action: 'Submitted crop report', entity: 'CropReport', entity_id: 8, created_at: daysAgo(5) },
    ],
  });

  console.log('✅ Seed complete');
  console.log('Admin:    admin@agricore.com    / Admin@123456');
  console.log('Farmer 1: farmer1@agricore.com  / Customer@123456');
  console.log('Farmer 2: farmer2@agricore.com  / Customer@123456');
  console.log('Farmer 3: farmer3@agricore.com  / Customer@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


