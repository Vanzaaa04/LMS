import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LabService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    userRole: string,
    data: {
      title: string;
      instructions: string;
      moduleId: string;
      fileUrl?: string;
      fileName?: string;
    },
  ) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: data.moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Forbidden: Only the instructor or Admin can create a lab for this course',
      );
    }

    const lab = await this.prisma.practicalLab.create({
      data: {
        title: data.title,
        instructions: data.instructions,
        moduleId: data.moduleId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
      },
    });

    // Kirim notifikasi cohort ke mahasiswa & dosen di kelas tersebut
    await this.notificationService.createCohortNotification(
      module.courseId,
      'Praktikum Baru Dirilis',
      `Praktikum baru '${data.title}' telah ditambahkan pada modul ${module.title} di kelas ${module.course.title}.`,
    );

    return lab;
  }

  async findAll(moduleId?: string) {
    return this.prisma.practicalLab.findMany({
      where: moduleId ? { moduleId } : {},
      include: {
        module: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const lab = await this.prisma.practicalLab.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lab) {
      throw new NotFoundException('Lab not found');
    }

    return lab;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    data: {
      title?: string;
      instructions?: string;
      fileUrl?: string;
      fileName?: string;
    },
  ) {
    const lab = await this.prisma.practicalLab.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!lab) {
      throw new NotFoundException('Lab not found');
    }

    if (lab.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Forbidden: Only the instructor or Admin can update this lab',
      );
    }

    return this.prisma.practicalLab.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const lab = await this.prisma.practicalLab.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!lab) {
      throw new NotFoundException('Lab not found');
    }

    if (lab.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Forbidden: Only the instructor or Admin can delete this lab',
      );
    }

    return this.prisma.practicalLab.delete({
      where: { id },
    });
  }
}

