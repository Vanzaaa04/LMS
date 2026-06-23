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
        }
      }
    }
  });

  if (!course) {
    console.log('Course not found');
    return;
  }

  for (const mod of course.modules) {
    console.log(`Module: ${mod.title}`);
    for (const assignment of mod.assignments) {
      console.log(`- Assignment: ${assignment.title} (ID: ${assignment.id})`);
      console.log(`  Submission Requirement: ${assignment.submissionRequirement}`);
    }
    for (const lab of mod.labs) {
      console.log(`- Lab: ${lab.title} (ID: ${lab.id})`);
    }
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
