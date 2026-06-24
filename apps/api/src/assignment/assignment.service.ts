import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Assignment } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AssignmentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    userRole: string,
    data: {
      title: string;
      description: string;
      status?: string;
      deadline: Date;
      templateUrl?: string;
      templateName?: string;
      submissionRequirement?: string;
      maxAttempts?: number;
      gradingMethod?: string;
      moduleId: string;
    },
  ): Promise<Assignment> {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: data.moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Forbidden: Only the instructor or Admin can create an assignment for this course',
      );
    }

    // 2. create assignment
    const assignment = await this.prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status ?? 'DRAFT',
        deadline: data.deadline,
        templateUrl: data.templateUrl,
        templateName: data.templateName,
        submissionRequirement: data.submissionRequirement,
        maxAttempts: data.maxAttempts ?? 1,
        gradingMethod: data.gradingMethod ?? 'LATEST',
        moduleId: data.moduleId,
      },
    });

    // Kirim notifikasi cohort ke mahasiswa & dosen di kelas tersebut
    await this.notificationService.createCohortNotification(
      module.courseId,
      'Tugas Baru Dirilis',
      `Tugas baru '${data.title}' telah ditambahkan pada modul ${module.title} di kelas ${module.course.title}.`,
    );

    return assignment;
  }

  async findAll(moduleId?: string) {
    return this.prisma.assignment.findMany({
      where: moduleId ? { moduleId } : undefined,
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    return assignment;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    data: { 
      title?: string; 
      description?: string; 
      deadline?: Date; 
      status?: string;
      templateUrl?: string;
      templateName?: string;
      submissionRequirement?: string;
      maxAttempts?: number;
      gradingMethod?: string;
    },
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validasi kepemilikan Dosen atau ADMIN
    if (assignment.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Forbidden: Only the instructor or Admin can update this assignment',
      );
    }

    return this.prisma.assignment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validasi kepemilikan Dosen atau ADMIN
    if (assignment.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Forbidden: Only the instructor or Admin can delete this assignment',
      );
    }

    return this.prisma.assignment.delete({
      where: { id },
    });
  }

  async submit(
    assignmentId: string,
    studentId: string,
    data: { fileUrl: string; note?: string },
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { module: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validation 1: Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: assignment.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You must be enrolled in the course to submit this assignment',
      );
    }

    // Validation 2: Check attempts limit
    const existingSubmissions = await this.prisma.assignmentSubmission.findMany({
      where: {
        assignmentId,
        studentId,
      },
      orderBy: { attemptNumber: 'desc' },
    });

    if (assignment.maxAttempts > 0 && existingSubmissions.length >= assignment.maxAttempts) {
      throw new BadRequestException(
        `You have reached the maximum number of attempts (${assignment.maxAttempts})`,
      );
    }

    const nextAttempt = existingSubmissions.length > 0 ? existingSubmissions[0].attemptNumber + 1 : 1;

    // Create submission
    return this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl: data.fileUrl,
        note: data.note,
        status: 'PENDING',
        attemptNumber: nextAttempt,
      },
    });
  }

  async getSubmissions(assignmentId: string, userId: string, userRole?: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { module: { include: { course: true } } },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Validation: Only course instructor or admin can see submissions
    if (assignment.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Only the instructor or admin can view submissions');
    }

    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { studentId: 'asc' },
        { attemptNumber: 'desc' }
      ],
    });
  }

  async gradeSubmission(
    submissionId: string,
    userId: string,
    data: { score: number; feedback?: string },
    userRole?: string,
  ) {
    if (data.score < 0 || data.score > 100) {
      throw new BadRequestException('Score harus antara 0 dan 100.');
    }

    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { module: { include: { course: true } } },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Validation: Only course instructor or admin can grade
    if (submission.assignment.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only the instructor or admin can grade this submission',
      );
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        status: 'GRADED',
      },
    });
  }

  async getMySubmission(assignmentId: string, studentId: string) {
    // Return the effective submission depending on gradingMethod?
    // Actually, returning the latest submission makes the most sense for the UI,
    // so they see their latest uploaded file. Wait, what if they want to see their highest?
    // The UI currently expects a single object.
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: {
        assignmentId,
        studentId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (submissions.length === 0) return null;

    if (assignment?.gradingMethod === 'HIGHEST') {
      // Find the one with highest score
      let highest = submissions[0];
      for (const sub of submissions) {
        if ((sub.score ?? -1) > (highest.score ?? -1)) {
          highest = sub;
        }
      }
      // Attach the total attempts count so UI knows
      return { ...highest, _totalAttempts: submissions.length, _maxAttempts: assignment.maxAttempts };
    }

    // Default LATEST
    return { ...submissions[0], _totalAttempts: submissions.length, _maxAttempts: assignment?.maxAttempts ?? 1 };
  }
}
