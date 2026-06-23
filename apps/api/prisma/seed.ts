import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── 1. Create Users ───────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kampus.ac.id' },
    update: {},
    create: {
      name: 'Admin Utama',
      email: 'admin@kampus.ac.id',
      password: passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  const dosen1 = await prisma.user.upsert({
    where: { email: 'dosen1@kampus.ac.id' },
    update: {},
    create: {
      name: 'Dr. Ahmad Fauzi, M.Kom',
      email: 'dosen1@kampus.ac.id',
      password: passwordHash,
      role: 'LECTURER',
    },
  });
  console.log(`✅ Dosen 1 created: ${dosen1.email}`);

  const dosen2 = await prisma.user.upsert({
    where: { email: 'dosen2@kampus.ac.id' },
    update: {},
    create: {
      name: 'Prof. Siti Rahmawati, Ph.D',
      email: 'dosen2@kampus.ac.id',
      password: passwordHash,
      role: 'LECTURER',
    },
  });
  console.log(`✅ Dosen 2 created: ${dosen2.email}`);

  const mhs1 = await prisma.user.upsert({
    where: { email: 'mahasiswa1@kampus.ac.id' },
    update: {},
    create: {
      name: 'Rizky Pratama',
      email: 'mahasiswa1@kampus.ac.id',
      password: passwordHash,
      role: 'STUDENT',
      angkatan: 2023,
      semester: 1,
    },
  });
  console.log(`✅ Mahasiswa 1 created: ${mhs1.email}`);

  const mhs2 = await prisma.user.upsert({
    where: { email: 'mahasiswa2@kampus.ac.id' },
    update: {},
    create: {
      name: 'Dewi Lestari',
      email: 'mahasiswa2@kampus.ac.id',
      password: passwordHash,
      role: 'STUDENT',
      angkatan: 2023,
      semester: 1,
    },
  });
  console.log(`✅ Mahasiswa 2 created: ${mhs2.email}`);

  console.log('\n✅ Seeding finished successfully!');
  console.log('\n📋 Akun Login (Password: password123):');
  console.log('────────────────────────────────────────');
  console.log(`Admin       : ${admin.email}`);
  console.log(`Dosen 1     : ${dosen1.email}`);
  console.log(`Dosen 2     : ${dosen2.email}`);
  console.log(`Mahasiswa 1 : ${mhs1.email}`);
  console.log(`Mahasiswa 2 : ${mhs2.email}`);
  console.log('────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
