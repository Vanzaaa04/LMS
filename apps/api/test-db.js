const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Mencoba koneksi ke database...");
    await prisma.$connect();
    console.log("SUKSES: Berhasil terhubung ke database PostgreSQL!");
    
    // Coba eksekusi query sederhana
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("Hasil query test:", result);
  } catch (error) {
    console.error("GAGAL TERHUBUNG KE DATABASE:");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
