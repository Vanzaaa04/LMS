/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma.service';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminId: string;
  let studentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 1. Create a dummy admin user directly via Prisma (since register usually creates STUDENT)
    const adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin.e2e@test.com',
        password: 'password123', // In real life, should be hashed, but our mock auth service might check hash.
        // Actually, we must register via Auth endpoint to get hashed password, then update to ADMIN via Prisma.
      },
    });

    // Cleanup first to avoid unique constraint errors if previous tests failed
    await prisma.user.deleteMany({
      where: { email: { in: ['admin.e2e@test.com', 'student.e2e@test.com'] } },
    });

    // Proper setup:
    // A. Register Admin
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Super Admin',
      email: 'admin.e2e@test.com',
      password: 'password123',
    });

    // Make him ADMIN
    const adminRecord = await prisma.user.findUnique({
      where: { email: 'admin.e2e@test.com' },
    });
    adminId = adminRecord!.id;
    await prisma.user.update({
      where: { id: adminId },
      data: { role: 'ADMIN' },
    });

    // B. Register Student
    await request(app.getHttpServer()).post('/auth/register').send({
      name: 'Student E2E',
      email: 'student.e2e@test.com',
      password: 'password123',
    });
    const studentRecord = await prisma.user.findUnique({
      where: { email: 'student.e2e@test.com' },
    });
    studentId = studentRecord!.id;

    // C. Login Admin to get Token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin.e2e@test.com',
        password: 'password123',
      });
    adminToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: { in: ['admin.e2e@test.com', 'student.e2e@test.com'] } },
    });
    await app.close();
  });

  it('/admin/statistics (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/statistics')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('totalUsers');
    expect(res.body.totalAdmins).toBeGreaterThanOrEqual(1);
    expect(res.body.totalStudents).toBeGreaterThanOrEqual(1);
  });

  it('/admin/users (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBeTruthy();
    const adminFound = res.body.find((u) => u.email === 'admin.e2e@test.com');
    expect(adminFound).toBeDefined();
  });

  it('/admin/users/:id (PUT) - Demote Student to Lecturer', async () => {
    const res = await request(app.getHttpServer())
      .put(`/admin/users/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'LECTURER' })
      .expect(200);

    expect(res.body.role).toEqual('LECTURER');
  });

  it('/admin/users/:id (DELETE) - Should prevent self delete', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/admin/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);

    expect(res.body.message).toContain('Admin cannot delete their own account');
  });

  it('/admin/users/:id (DELETE) - Should delete student', async () => {
    await request(app.getHttpServer())
      .delete(`/admin/users/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const checkUser = await prisma.user.findUnique({
      where: { id: studentId },
    });
    expect(checkUser).toBeNull();
  });
});
