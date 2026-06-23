const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const faris = await prisma.user.findFirst({
    where: { email: 'B@B' }
  });
  
  const course = await prisma.course.findFirst({
    where: { title: 'BASIS DAATA' }
  });

  if (!faris || !course) {
    console.log('Faris or BASIS DAATA course not found');
    return;
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: faris.id,
      courseId: course.id
    }
  });

  console.log(`Faris (${faris.id}) enrollment in BASIS DAATA (${course.id}): ${enrollment ? 'Enrolled' : 'Not Enrolled'}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
