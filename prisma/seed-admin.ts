import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding admin user...');

  const adminEmail = 'admin@admin.com';
  const adminPassword = 'P@ss0rd!!';
  const adminFullName = 'System Administrator';

  // Check if admin already exists
  const existingAdmin = await prisma.profile.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Updating...');
    
    // Hash password
    const password_hash = await bcrypt.hash(adminPassword, 10);

    // Update existing admin
    const updatedAdmin = await prisma.profile.update({
      where: { email: adminEmail },
      data: {
        email: adminEmail,
        password_hash,
        full_name: adminFullName,
        role: 'admin',
        email_verified: true,
        plan_status: 'paid',
      },
    });

    console.log(`✓ Admin user updated: ${updatedAdmin.email}`);
    console.log(`  ID: ${updatedAdmin.id}`);
    console.log(`  Role: ${updatedAdmin.role}`);
    console.log(`  Email Verified: ${updatedAdmin.email_verified}`);
    console.log(`  Plan Status: ${updatedAdmin.plan_status}`);
  } else {
    // Hash password
    const password_hash = await bcrypt.hash(adminPassword, 10);

    // Create new admin user
    const admin = await prisma.profile.create({
      data: {
        email: adminEmail,
        password_hash,
        full_name: adminFullName,
        role: 'admin',
        email_verified: true,
        plan_status: 'paid',
      },
    });

    console.log(`✓ Admin user created: ${admin.email}`);
    console.log(`  ID: ${admin.id}`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Email Verified: ${admin.email_verified}`);
    console.log(`  Plan Status: ${admin.plan_status}`);
  }

  console.log('\nAdmin user credentials:');
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log('\nAdmin user seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });











