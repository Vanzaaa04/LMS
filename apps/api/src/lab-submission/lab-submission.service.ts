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

    // Validasi 3: Cek apakah mahasiswa sudah mencapai batas maxAttempts
    const existingSubmissions = await this.prisma.labSubmission.findMany({
      where: {
        labId: labId,
        studentId: userId,
      },
      orderBy: { attemptNumber: 'desc' },
    });

    if (existingSubmissions.length >= lab.maxAttempts) {
      throw new BadRequestException(
        `Anda sudah mencapai batas maksimal pengumpulan (${lab.maxAttempts} kali).`,
      );
    }

    const nextAttempt = existingSubmissions.length > 0 ? existingSubmissions[0].attemptNumber + 1 : 1;

    // Simpan data submission baru dengan status awal "PENDING"
    const submission = await this.prisma.labSubmission.create({
      data: {
        labId: labId,
        studentId: userId,
        fileUrl: data.fileUrl,
        note: data.note,
        status: 'PENDING',
        attemptNumber: nextAttempt,
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
    return this.prisma.labSubmission.findMany({
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
      orderBy: [
        { studentId: 'asc' },
        { attemptNumber: 'desc' }
      ],
    });
  }

  /**
   * Dosen memberikan nilai (grading) pada submission mahasiswa tertentu.
   */
  async gradeSubmission(
    submissionId: string,
    userId: string,
    data: { score: number; feedback?: string },
    userRole?: string,
  ) {
    if (data.score < 0 || data.score > 100) {
      throw new BadRequestException('Skor harus berada di antara 0 dan 100.');
    }

    const submission = await this.prisma.labSubmission.findUnique({
      where: { id: submissionId },
      include: {
        lab: {
          include: { module: { include: { course: true } } },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Data submission tidak ditemukan.');
    }

    if (
      submission.lab.module.course.instructorId !== userId &&
      userRole !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Hanya dosen pengampu mata kuliah atau admin yang bisa memberikan nilai.',
      );
    }

    return this.prisma.labSubmission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        status: 'GRADED', // Otomatis ubah status menjadi GRADED setelah dinilai
      },
    });
  }

  /**
   * Mengambil data submission mahasiswa yang sedang login (jika sudah submit).
   */
  async getMySubmission(labId: string, studentId: string) {
    const lab = await this.prisma.practicalLab.findUnique({
      where: { id: labId },
    });

    const submissions = await this.prisma.labSubmission.findMany({
      where: {
        labId: labId,
        studentId: studentId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (submissions.length === 0) return null;

    if (lab?.gradingMethod === 'HIGHEST') {
      let highest = submissions[0];
      for (const sub of submissions) {
        if ((sub.score ?? -1) > (highest.score ?? -1)) {
          highest = sub;
        }
      }
      return { ...highest, _totalAttempts: submissions.length, _maxAttempts: lab.maxAttempts };
    }

    // Default LATEST
    return { ...submissions[0], _totalAttempts: submissions.length, _maxAttempts: lab?.maxAttempts ?? 1 };
  }
}
