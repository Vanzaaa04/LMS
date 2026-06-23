import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MaterialType } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MaterialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    userId: string,
    userRole: string,
    data: {
      title: string;
      type: MaterialType;
      content?: string;
      url?: string;
      moduleId: string;
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
        'You are not authorized to add material to this module',
      );
    }

    const material = await this.prisma.material.create({
      data: {
        title: data.title,
        type: data.type,
        content: data.content,
        url: data.url,
        moduleId: data.moduleId,
      },
    });

    // Kirim notifikasi cohort ke mahasiswa & dosen di kelas tersebut
    await this.notificationService.createCohortNotification(
      module.courseId,
      'Materi Baru Dirilis',
      `Materi baru '${data.title}' telah ditambahkan pada modul ${module.title} di kelas ${module.course.title}.`,
    );

    return material;
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    data: {
      title?: string;
      type?: MaterialType;
      content?: string;
      url?: string;
    },
  ) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this material',
      );
    }

    return this.prisma.material.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.module.course.instructorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to delete this material',
      );
    }

    return this.prisma.material.delete({
      where: { id },
    });
  }
}
