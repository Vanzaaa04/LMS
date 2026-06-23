const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing default seed courses...');

  // Find courses to delete
  const coursesToDelete = await prisma.course.findMany({
    where: {
      title: {
        in: ['Basis Data Lanjutan', 'Pemrograman Web Lanjut'],
      },
    },
  });

  if (coursesToDelete.length === 0) {
    console.log('ℹ️ No dummy courses found in the database.');
    return;
  }

  for (const course of coursesToDelete) {
    // Cascade delete via Prisma relations
    await prisma.course.delete({
      where: { id: course.id },
    });
    console.log(`✅ Deleted course: ${course.title} (${course.id})`);
  }

  console.log('🎉 Database cleanup complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
