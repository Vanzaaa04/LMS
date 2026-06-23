const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const lab = await prisma.practicalLab.findFirst({
    where: { title: { contains: 'DATA MODELER' } },
    include: {
      module: {
        include: {
          course: true
        }
      }
    }
  });
  console.log(JSON.stringify(lab, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
