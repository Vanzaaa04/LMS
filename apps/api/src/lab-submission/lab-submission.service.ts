import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LabSubmissionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Mahasiswa mengumpulkan hasil praktikum.
   * Melakukan 3 validasi berturut-turut sebelum menyimpan data submission.
   */
  async submit(
    labId: string,
    userId: string,
    data: { fileUrl: string; note?: string },
  ) {
    // Validasi 1: Cek lab ada di database
    const lab = await this.prisma.practicalLab.findUnique({
      where: { id: labId },
      include: { module: true },
    });

    if (!lab) {
      throw new NotFoundException(`Lab dengan ID "${labId}" tidak ditemukan`);
    }

    // Validasi 2: Cek mahasiswa terdaftar di kelas lab tersebut
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: lab.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'Anda tidak terdaftar di kelas ini. Hanya mahasiswa yang terdaftar yang bisa mengumpulkan hasil praktikum.',
      );
    }

    // Validasi 3: Cek apakah mahasiswa sudah pernah submit sebelumnya
    const existingSubmission = await this.prisma.labSubmission.findUnique({
      where: {
        labId_studentId: {
          labId: labId,
          studentId: userId,
        },
      },
    });

    if (existingSubmission) {
      throw new BadRequestException(
        'Anda sudah pernah mengumpulkan hasil praktikum untuk lab ini.',
      );
    }

    // Simpan data submission baru dengan status awal "PENDING"
    const submission = await this.prisma.labSubmission.create({
      data: {
        labId: labId,
        studentId: userId,
        fileUrl: data.fileUrl,
        note: data.note,
        status: 'PENDING',
      },
    });

    return submission;
  }

  /**
   * Dosen melihat daftar mahasiswa yang sudah mengumpulkan hasil praktikum.
   * Menampilkan nama mahasiswa, file, waktu pengumpulan, status, dan skor.
   */
  async getSubmissions(labId: string, userId: string, userRole?: string) {
    // Cek lab ada di database beserta data course-nya
    const lab = await this.prisma.practicalLab.findUnique({
      where: { id: labId },
      include: { module: { include: { course: true } } },
    });

    if (!lab) {
      throw new NotFoundException(`Lab dengan ID "${labId}" tidak ditemukan`);
    }

    // Cek bahwa userId adalah dosen pemilik course atau admin
    if (lab.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Hanya dosen pemilik mata kuliah atau Admin yang bisa melihat daftar submission.',
      );
    }

    // Query seluruh submission untuk lab ini, termasuk data mahasiswa
    const submissions = await this.prisma.labSubmission.findMany({
      where: { labId: labId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions;
  }

  /**
   * Dosen memberikan nilai dan feedback untuk submission mahasiswa.
   * Mengubah status dari "PENDING" menjadi "GRADED".
   */
  async grade(
    submissionId: string,
    userId: string,
    data: { score: number; feedback?: string },
    userRole?: string,
  ) {
    // Validasi score harus antara 0 dan 100
    if (data.score < 0 || data.score > 100) {
      throw new BadRequestException('Score harus antara 0 dan 100.');
    }

    // Cek submission ada di database (beserta relasi berantai: submission > lab > course)
    const submission = await this.prisma.labSubmission.findUnique({
      where: { id: submissionId },
      include: {
        lab: {
          include: { module: { include: { course: true } } },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission dengan ID "${submissionId}" tidak ditemukan`,
      );
    }

    // Cek bahwa userId adalah dosen pemilik course dari lab tersebut atau admin
    if (submission.lab.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Hanya dosen pemilik mata kuliah atau Admin yang bisa memberikan nilai.',
      );
    }

    // Update submission: simpan score, feedback, dan ubah status menjadi "GRADED"
    const updatedSubmission = await this.prisma.labSubmission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        status: 'GRADED',
      },
    });

    return updatedSubmission;
  }

  async getMySubmission(labId: string, studentId: string) {
    return this.prisma.labSubmission.findUnique({
      where: {
        labId_studentId: {
          labId,
          studentId,
        },
      },
    });
  }
}
