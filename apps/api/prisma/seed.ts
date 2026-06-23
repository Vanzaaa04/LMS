import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── 1. Create Users ───────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ruangdosen.ac.id' },
    update: {},
    create: {
      name: 'Admin Ruang Dosen',
      email: 'admin@ruangdosen.ac.id',
      password: passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  const dosen1 = await prisma.user.upsert({
    where: { email: 'dosen@ruangdosen.ac.id' },
    update: {},
    create: {
      name: 'Dr. Aris Setiawan',
      email: 'dosen@ruangdosen.ac.id',
      password: passwordHash,
      role: 'LECTURER',
    },
  });
  console.log(`✅ Dosen 1 created: ${dosen1.email}`);

  const dosen2 = await prisma.user.upsert({
    where: { email: 'dosen2@ruangdosen.ac.id' },
    update: {},
    create: {
      name: 'Prof. Heru Prasetyo',
      email: 'dosen2@ruangdosen.ac.id',
      password: passwordHash,
      role: 'LECTURER',
    },
  });
  console.log(`✅ Dosen 2 created: ${dosen2.email}`);

  const mhs1 = await prisma.user.upsert({
    where: { email: 'mahasiswa@ruangdosen.ac.id' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'mahasiswa@ruangdosen.ac.id',
      password: passwordHash,
      role: 'STUDENT',
      angkatan: 2023,
    },
  });
  console.log(`✅ Mahasiswa 1 created: ${mhs1.email}`);

  const mhs2 = await prisma.user.upsert({
    where: { email: 'mahasiswa2@ruangdosen.ac.id' },
    update: {},
    create: {
      name: 'Siti Aminah',
      email: 'mahasiswa2@ruangdosen.ac.id',
      password: passwordHash,
      role: 'STUDENT',
      angkatan: 2023,
    },
  });
  console.log(`✅ Mahasiswa 2 created: ${mhs2.email}`);

  // Also keep the old test accounts for backward compatibility
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Admin Kampus',
      email: 'admin@test.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });
  await prisma.user.upsert({
    where: { email: 'dosen@test.com' },
    update: {},
    create: {
      name: 'Dosen Ariel',
      email: 'dosen@test.com',
      password: passwordHash,
      role: 'LECTURER',
    },
  });
  await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      name: 'Mahasiswa Rajin',
      email: 'student@test.com',
      password: passwordHash,
      role: 'STUDENT',
    },
  });

  // ─── 2. Create Courses ─────────────────────────────────────────
  // Check if courses already exist to avoid duplicates
  const existingCourses = await prisma.course.findMany({
    where: { instructorId: dosen1.id },
  });

  if (false) {
    const course1 = await prisma.course.create({
      data: {
        title: 'Pemrograman Web Lanjut',
        description: 'Mempelajari konsep-konsep lanjutan dalam pengembangan aplikasi web modern menggunakan React, Next.js, dan NestJS.',
        credits: 3,
        department: 'Teknik Informatika',
        semester: 'Ganjil 2026/2027',
        enrollmentCap: 40,
        status: 'Active',
        instructorId: dosen1.id,
        modules: {
          create: [
            {
              title: 'Pengantar Web Modern',
              description: 'Fundamental HTML5, CSS3, dan JavaScript ES6+',
              order: 1,
              materials: {
                create: [
                  {
                    title: 'Slide: Arsitektur Web Modern',
                    type: 'DOCUMENT',
                    url: '/uploads/slide-web-modern.pdf',
                  },
                  {
                    title: 'Video: Setup Development Environment',
                    type: 'VIDEO',
                    url: 'https://www.youtube.com/watch?v=example1',
                  },
                ],
              },
              assignments: {
                create: [
                  {
                    title: 'Tugas 1: Portfolio Website',
                    description: 'Buat website portfolio pribadi menggunakan HTML, CSS, dan JavaScript. Harus responsif dan memiliki minimal 3 halaman.',
                    status: 'ACTIVE',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: 'Quiz: Dasar-Dasar Web',
                    status: 'PUBLISHED',
                    passingScore: 70,
                    xpReward: 100,
                    timeLimit: 30,
                    questions: {
                      create: [
                        {
                          question: 'Apa kepanjangan dari HTML?',
                          options: JSON.stringify(['HyperText Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language']),
                          correctAnswer: 'A',
                        },
                        {
                          question: 'CSS digunakan untuk?',
                          options: JSON.stringify(['Membuat logika program', 'Mengatur tampilan halaman', 'Mengelola database', 'Membuat server']),
                          correctAnswer: 'B',
                        },
                        {
                          question: 'Manakah yang termasuk JavaScript framework?',
                          options: JSON.stringify(['Laravel', 'Django', 'React', 'Flask']),
                          correctAnswer: 'C',
                        },
                      ],
                    },
                  },
                ],
              },
              labs: {
                create: [
                  {
                    title: 'Lab 1: Setup Project React',
                    instructions: 'Ikuti langkah-langkah berikut untuk setup project React menggunakan Vite:\n1. Install Node.js versi terbaru\n2. Jalankan npx create-vite@latest my-app\n3. Pilih template React + TypeScript\n4. Screenshot hasil dan upload',
                  },
                ],
              },
            },
            {
              title: 'React & Component-Based Architecture',
              description: 'Memahami konsep komponen, props, state, dan lifecycle di React',
              order: 2,
              materials: {
                create: [
                  {
                    title: 'Artikel: Thinking in React',
                    type: 'TEXT',
                    content: 'React adalah library JavaScript untuk membangun user interface. Konsep utamanya adalah component-based architecture dimana UI dipecah menjadi komponen-komponen kecil yang reusable.',
                  },
                ],
              },
              assignments: {
                create: [
                  {
                    title: 'Tugas 2: Todo App dengan React',
                    description: 'Buat aplikasi Todo List menggunakan React dengan fitur: tambah, hapus, edit, dan tandai selesai. Gunakan useState dan useEffect.',
                    status: 'ACTIVE',
                    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                  },
                ],
              },
              quizzes: {
                create: [
                  {
                    title: 'Quiz: React Components',
                    status: 'PUBLISHED',
                    passingScore: 70,
                    xpReward: 150,
                    timeLimit: 20,
                    questions: {
                      create: [
                        {
                          question: 'Apa itu JSX?',
                          options: JSON.stringify(['JavaScript XML', 'Java Syntax Extension', 'JSON Extra', 'JavaScript Extension']),
                          correctAnswer: 'A',
                        },
                        {
                          question: 'Hook yang digunakan untuk state management di React?',
                          options: JSON.stringify(['useEffect', 'useState', 'useRef', 'useMemo']),
                          correctAnswer: 'B',
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`✅ Course 1 created: ${course1.title}`);

    const course2 = await prisma.course.create({
      data: {
        title: 'Basis Data Lanjutan',
        description: 'Konsep-konsep lanjutan dalam desain dan implementasi basis data relasional dan NoSQL.',
        credits: 3,
        department: 'Teknik Informatika',
        semester: 'Ganjil 2026/2027',
        enrollmentCap: 35,
        status: 'Active',
        instructorId: dosen2.id,
        modules: {
          create: [
            {
              title: 'Normalisasi Database',
              description: 'Memahami bentuk normal 1NF, 2NF, 3NF, dan BCNF',
              order: 1,
              assignments: {
                create: [
                  {
                    title: 'Tugas: Normalisasi Tabel',
                    description: 'Diberikan sebuah tabel yang belum ternormalisasi. Normalisasikan hingga bentuk 3NF dan jelaskan setiap langkahnya.',
                    status: 'ACTIVE',
                    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                  },
                ],
              },
            },
            {
              title: 'Query Optimization',
              description: 'Teknik optimasi query SQL: indexing, query plan, dan performance tuning',
              order: 2,
            },
          ],
        },
      },
    });
    console.log(`✅ Course 2 created: ${course2.title}`);

    // ─── 3. Enrollments ─────────────────────────────────────────
    await prisma.enrollment.createMany({
      data: [
        { userId: mhs1.id, courseId: course1.id },
        { userId: mhs1.id, courseId: course2.id },
        { userId: mhs2.id, courseId: course1.id },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Enrollments created');

    // ─── 4. Sample Submissions ──────────────────────────────────
    // Get assignments for submissions
    const assignments = await prisma.assignment.findMany({
      where: { module: { courseId: course1.id } },
      orderBy: { createdAt: 'asc' },
    });

    if (assignments.length > 0) {
      // Budi submits first assignment
      await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId: assignments[0].id,
            studentId: mhs1.id,
          },
        },
        update: {},
        create: {
          assignmentId: assignments[0].id,
          studentId: mhs1.id,
          fileUrl: '/uploads/budi-portfolio.zip',
          note: 'Sudah selesai mengerjakan tugas portfolio website.',
          status: 'PENDING',
        },
      });

      // Siti submits first assignment (already graded)
      await prisma.assignmentSubmission.upsert({
        where: {
          assignmentId_studentId: {
            assignmentId: assignments[0].id,
            studentId: mhs2.id,
          },
        },
        update: {},
        create: {
          assignmentId: assignments[0].id,
          studentId: mhs2.id,
          fileUrl: '/uploads/siti-portfolio.zip',
          note: 'Portfolio website dengan tema minimalis.',
          status: 'GRADED',
          score: 85,
          feedback: 'Desain bagus dan responsif. Perlu perbaikan di bagian accessibility.',
        },
      });
      console.log('✅ Assignment submissions created');
    }

    // Quiz submission
    const quizzes = await prisma.quiz.findMany({
      where: { module: { courseId: course1.id } },
      include: { questions: true },
      orderBy: { createdAt: 'asc' },
    });

    if (quizzes.length > 0 && quizzes[0].questions.length > 0) {
      await prisma.quizSubmission.upsert({
        where: {
          quizId_studentId: {
            quizId: quizzes[0].id,
            studentId: mhs2.id,
          },
        },
        update: {},
        create: {
          quizId: quizzes[0].id,
          studentId: mhs2.id,
          score: 80,
          passed: true,
          details: JSON.stringify(
            quizzes[0].questions.map((q) => ({
              questionId: q.id,
              answer: q.correctAnswer,
              correct: true,
            })),
          ),
        },
      });

      // Update XP for mhs2
      await prisma.user.update({
        where: { id: mhs2.id },
        data: { xp: 100 },
      });
      console.log('✅ Quiz submission + XP created');
    }
  } else {
    console.log('ℹ️ Courses already exist, skipping creation');
  }

  console.log('\n✅ Seeding finished successfully!');
  console.log('\n📋 Akun Login:');
  console.log('────────────────────────────────────────');
  console.log('Admin    : admin@ruangdosen.ac.id / password123');
  console.log('Dosen 1  : dosen@ruangdosen.ac.id / password123');
  console.log('Dosen 2  : dosen2@ruangdosen.ac.id / password123');
  console.log('Mhs 1    : mahasiswa@ruangdosen.ac.id / password123');
  console.log('Mhs 2    : mahasiswa2@ruangdosen.ac.id / password123');
  console.log('────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
