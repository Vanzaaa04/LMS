const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const course = await prisma.course.findFirst({
    where: { title: 'BASIS DAATA' }
  });
  console.log(JSON.stringify(course, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
