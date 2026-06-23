const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const submissions = await prisma.quizSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      quiz: true
    }
  });
  console.log(JSON.stringify(submissions, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
