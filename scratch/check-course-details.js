const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const course = await prisma.course.findFirst({
    where: { title: 'BASIS DAATA' },
    include: {
      modules: {
        include: {
          labs: true,
          assignments: true,
          quizzes: true,
        }
      }
    }
  });

  if (!course) {
    console.log('Course BASIS DAATA not found');
    return;
  }

  console.log(`Course: ${course.title} (ID: ${course.id})`);
  for (const mod of course.modules) {
    console.log(`\nModule: ${mod.title}`);
    console.log(` - Labs: ${mod.labs.map(l => l.title).join(', ') || 'None'}`);
    console.log(` - Assignments: ${mod.assignments.map(a => a.title).join(', ') || 'None'}`);
    console.log(` - Quizzes: ${mod.quizzes.map(q => q.title).join(', ') || 'None'}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
