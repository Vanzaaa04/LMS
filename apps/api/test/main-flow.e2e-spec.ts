/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';

describe('Main Flow Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Tokens & IDs
  let lecturerToken: string;
  let lecturerId: string;
  let studentToken: string;
  let studentId: string;
  let courseId: string;
  let moduleId: string;
  let quizId: string;
  let assignmentId: string;
  let submissionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Cleanup first
    await prisma.user.deleteMany({
      where: {
        email: { in: ['lecturer.e2e@test.com', 'student.flow@test.com'] },
      },
    });

    // 1. Setup Lecturer
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Lecturer Flow',
      email: 'lecturer.e2e@test.com',
      password: 'password123',
    });
    const lecUser = await prisma.user.findUnique({
      where: { email: 'lecturer.e2e@test.com' },
    });
    await prisma.user.update({
      where: { id: lecUser!.id },
      data: { role: 'LECTURER' },
    });
    lecturerId = lecUser!.id;

    const lecLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'lecturer.e2e@test.com',
        password: 'password123',
      });
    lecturerToken = lecLogin.body.access_token;

    // 2. Setup Student
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Student Flow',
      email: 'student.flow@test.com',
      password: 'password123',
    });
    const stuLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'student.flow@test.com',
        password: 'password123',
      });
    studentToken = stuLogin.body.access_token;
    const stuUser = await prisma.user.findUnique({
      where: { email: 'student.flow@test.com' },
    });
    studentId = stuUser!.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ['lecturer.e2e@test.com', 'student.flow@test.com'] },
      },
    });
    await app.close();
  });

  // --- SINTA'S FEATURE (Course & Material) ---
  it('1. Lecturer should be able to create a Course', async () => {
    const res = await request(app.getHttpServer())
      .post('/courses')
      .set('Authorization', `Bearer ${lecturerToken}`)
      .send({
        title: 'E2E Fullstack Course',
        description: 'Testing',
        instructorId: lecturerId,
      })
      .expect(201);
    courseId = res.body.id;
    expect(res.body.title).toBe('E2E Fullstack Course');
  });

  it('1.5 Lecturer should be able to create a Module', async () => {
    const res = await request(app.getHttpServer())
      .post(`/courses/${courseId}/modules`)
      .set('Authorization', `Bearer ${lecturerToken}`)
      .send({
        title: 'Module 1: E2E',
        description: 'Module testing',
      })
      .expect(201);
    moduleId = res.body.id;
    expect(res.body.title).toBe('Module 1: E2E');
  });

  it('2. Student should be able to enroll in the Course', async () => {
    await request(app.getHttpServer())
      .post(`/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(201);
  });

  // --- TIO'S FEATURE (Quiz) ---
  it('3. Lecturer should be able to create a Quiz', async () => {
    const res = await request(app.getHttpServer())
      .post('/quizzes')
      .set('Authorization', `Bearer ${lecturerToken}`)
      .send({ title: 'E2E Quiz', moduleId, xpReward: 150, passingScore: 50 })
      .expect(201);
    quizId = res.body.id;
    expect(res.body.xpReward).toBe(150);
  });

  it('4. Lecturer should be able to add Questions', async () => {
    await request(app.getHttpServer())
      .post(`/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${lecturerToken}`)
      .send({
        question: '1+1?',
        optionA: '1',
        optionB: '2',
        optionC: '3',
        optionD: '4',
        correctAnswer: 'B',
      })
      .expect(201);
  });

  // --- DIMAS'S FEATURE (Assignment) ---
  it('5. Lecturer should be able to create an Assignment', async () => {
    const res = await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${lecturerToken}`)
      .send({
        title: 'E2E Task',
        description: 'Do it',
        deadline: new Date().toISOString(),
        moduleId,
      })
      .expect(201);
    assignmentId = res.body.id;
    expect(res.body.title).toBe('E2E Task');
  });

  it('6. Student should be able to submit Assignment', async () => {
    const res = await request(app.getHttpServer())
      .post(`/assignments/${assignmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ fileUrl: 'http://test.com/file.pdf', note: 'Done sir!' })
      .expect(201);
    submissionId = res.body.id;
    expect(res.body.status).toBe('PENDING');
  });

  it('7. Lecturer should be able to grade Submission', async () => {
    const res = await request(app.getHttpServer())
      .put(`/assignment-submissions/${submissionId}/grade`)
      .set('Authorization', `Bearer ${lecturerToken}`)
      .send({ score: 95, feedback: 'Great job!' })
      .expect(200);
    expect(res.body.status).toBe('GRADED');
    expect(res.body.score).toBe(95);
  });

  // --- ARIEL'S FEATURE (Quiz Scoring & Gamification) ---
  it('8. Student should be able to submit Quiz and get Auto-Scored', async () => {
    const questionsRes = await request(app.getHttpServer())
      .get(`/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    const questionId = questionsRes.body[0].id;

    const submitRes = await request(app.getHttpServer())
      .post(`/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: [{ questionId, answer: 'B' }] }) // 'B' is correct
      .expect(201);

    expect(submitRes.body.passed).toBe(true);
    expect(submitRes.body.score).toBe(100);
    expect(submitRes.body.xpGained).toBe(150);
  });

  it('9. Student should appear on Leaderboard with XP', async () => {
    const res = await request(app.getHttpServer())
      .get('/leaderboard')
      .expect(200);

    const studentLdb = res.body.find((u) => u.id === studentId);
    expect(studentLdb).toBeDefined();
    expect(studentLdb.xp).toBeGreaterThanOrEqual(150);
  });
});
