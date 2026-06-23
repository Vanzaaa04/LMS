const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.enrollment.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  console.log('Deleted all dummy courses!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
