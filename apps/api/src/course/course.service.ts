import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Course } from '@prisma/client';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    instructorId: string;
    credits?: number;
    department?: string;
    semester?: string;
    teachingFormat?: string;
    enrollmentCap?: number;
    status?: string;
    targetSemester?: number;
    targetAngkatan?: number;
  }): Promise<Course> {
    // 1. check if instructor exists
    const instructor = await this.prisma.user.findUnique({
      where: { id: data.instructorId },
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    // verify role
    if (instructor.role !== 'LECTURER' && instructor.role !== 'ADMIN') {
      throw new ForbiddenException('Only lecturers can create courses');
    }

    // 2. create course
    const course = await this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        credits: this.normalizeCourseCredits(data.credits),
        department: this.normalizeCourseText(data.department, 'Computer Science'),
        semester: this.normalizeCourseText(data.semester, 'Fall Semester 2026'),
        teachingFormat: data.teachingFormat || 'Teori dan Praktikum',
        enrollmentCap: this.normalizeEnrollmentCap(data.enrollmentCap),
        status: this.normalizeCourseStatus(data.status),
        instructorId: data.instructorId,
        targetSemester: data.targetSemester ?? 1,
        targetAngkatan: data.targetAngkatan ?? null,
      },
    });

    return course;
  }

  async enroll(courseId: string, userId: string, userRole: string) {
    // 0. Only students can enroll
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('Only students can enroll in courses');
    }

    // 1. Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 2. Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this course');
    }

    await this.ensureStudentHasAvailableCredits(userId, course.credits);

    // 3. Create enrollment
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });
  }

  async enrollStudentByEmail(courseId: string, email: string, instructorId: string, userRole?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId && userRole !== 'ADMIN') throw new ForbiddenException('Only the instructor can enroll students');

    const student = await this.prisma.user.findUnique({ where: { email } });
    if (!student) throw new NotFoundException('Student not found');
    if (student.role !== 'STUDENT') throw new ForbiddenException('User is not a student');

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: student.id, courseId } },
    });
    if (existingEnrollment) throw new ConflictException('Student is already enrolled');

    await this.ensureStudentHasAvailableCredits(student.id, course.credits);

    return this.prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId,
      },
      include: { user: true },
    });
  }

  async removeEnrollment(courseId: string, studentId: string, instructorId: string, userRole?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId && userRole !== 'ADMIN') throw new ForbiddenException('Only the instructor can remove students');

    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: studentId, courseId } },
    });
    if (!existingEnrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.enrollment.delete({
      where: { id: existingEnrollment.id },
    });
  }

  async getEnrollments(courseId: string, instructorId: string, userRole?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId && userRole !== 'ADMIN') throw new ForbiddenException('Only the instructor can view enrollments');

    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getMyCourses(userId: string, userRole: string) {
    // Dosen: kembalikan kursus yang mereka ajar
    if (userRole === 'LECTURER' || userRole === 'ADMIN') {
      return this.prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true, modules: true } },
        },
      });
    }

    // Mahasiswa: kembalikan kursus yang mereka ikuti
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { name: true },
            },
          },
        },
      },
    });

    return enrollments.map((e) => e.course);
  }

  async findAll(userId?: string, userRole?: string) {
    if (userRole === 'STUDENT' && userId) {
      const student = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (student) {
        return this.prisma.course.findMany({
          where: {
            targetSemester: student.semester || 1,
            OR: [
              { targetAngkatan: null },
              { targetAngkatan: student.angkatan || undefined },
            ],
          },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                xp: true,
              },
            },
            _count: {
              select: { enrollments: true, modules: true },
            },
          },
        });
      }
    }

    return this.prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            xp: true,
          },
        },
        _count: {
          select: { enrollments: true, modules: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
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

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      credits?: number;
      department?: string;
      semester?: string;
      teachingFormat?: string;
      enrollmentCap?: number;
      status?: string;
    },
    userId: string,
    userRole?: string,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not the instructor of this course');
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.credits !== undefined && {
          credits: this.normalizeCourseCredits(data.credits),
        }),
        ...(data.department !== undefined && {
          department: this.normalizeCourseText(data.department, course.department),
        }),
        ...(data.semester !== undefined && {
          semester: this.normalizeCourseText(data.semester, course.semester),
        }),
        ...(data.teachingFormat !== undefined && {
          teachingFormat: data.teachingFormat,
        }),
        ...(data.enrollmentCap !== undefined && {
          enrollmentCap: this.normalizeEnrollmentCap(data.enrollmentCap),
        }),
        ...(data.status !== undefined && {
          status: this.normalizeCourseStatus(data.status),
        }),
      },
    });
  }

  async remove(id: string, userId: string, userRole?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    if (course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not the instructor of this course');
    }

    // Delete enrollments first to avoid foreign key constraint errors
    await this.prisma.enrollment.deleteMany({
      where: { courseId: id },
    });

    return this.prisma.course.delete({
      where: { id },
    });
  }

  private normalizeCourseCredits(credits?: number) {
    const normalizedCredits = credits ?? 3;

    if (!Number.isInteger(normalizedCredits) || normalizedCredits <= 0) {
      throw new BadRequestException('Course credits must be a positive integer');
    }

    return normalizedCredits;
  }

  private normalizeEnrollmentCap(enrollmentCap?: number) {
    const normalizedEnrollmentCap = enrollmentCap ?? 60;

    if (!Number.isInteger(normalizedEnrollmentCap) || normalizedEnrollmentCap <= 0) {
      throw new BadRequestException('Enrollment capacity must be a positive integer');
    }

    return normalizedEnrollmentCap;
  }

  private normalizeCourseText(value: string | undefined, fallbackValue: string) {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      return fallbackValue;
    }

    return normalizedValue;
  }

  private normalizeCourseStatus(status?: string) {
    const normalizedStatus = status?.trim();

    if (!normalizedStatus) {
      return 'Active';
    }

    if (!['Active', 'Draft', 'Archived'].includes(normalizedStatus)) {
      throw new BadRequestException('Course status must be Active, Draft, or Archived');
    }

    return normalizedStatus;
  }

  private async ensureStudentHasAvailableCredits(studentId: string, courseCredits: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { maxCredits: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const usedCredits = await this.getStudentUsedCredits(studentId);
    const nextUsedCredits = usedCredits + courseCredits;

    if (nextUsedCredits > student.maxCredits) {
      throw new BadRequestException(
        `Enroll failed: credit limit exceeded. Used ${usedCredits}/${student.maxCredits} SKS, course requires ${courseCredits} SKS.`,
      );
    }
  }

  private async getStudentUsedCredits(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId },
      select: {
        course: {
          select: {
            credits: true,
          },
        },
      },
    });

    return enrollments.reduce(
      (totalCredits, enrollment) => totalCredits + enrollment.course.credits,
      0,
    );
  }
}
