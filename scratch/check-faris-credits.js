const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const faris = await prisma.user.findFirst({
    where: { email: 'B@B' }
  });
  console.log('Faris User Info:', JSON.stringify(faris, null, 2));

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: faris.id },
    include: { course: true }
  });
  console.log('Faris Enrollments:', JSON.stringify(enrollments, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
