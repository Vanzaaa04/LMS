import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findUnique({
    where: { id: '699653d2-1c9b-44a5-ba8c-d48c2cfcbaaa' },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      modules: {
        include: {
          materials: true,
          quizzes: true,
          assignments: {
            include: {
              _count: { select: { submissions: true } },
            },
          },
          labs: true,
        },
      },
    },
  });

  console.log(course ? "FOUND" : "NOT_FOUND");
}

main().catch(console.error).finally(() => prisma.$disconnect());
