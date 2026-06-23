import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async create(courseId: string, title: string, description: string | undefined, instructorId: string, role: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (role !== 'ADMIN' && course.instructorId !== instructorId) throw new ForbiddenException('Not authorized');

    const lastModule = await this.prisma.courseModule.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
    });
    const order = lastModule ? lastModule.order + 1 : 1;

    return this.prisma.courseModule.create({
      data: { courseId, title, description, order },
    });
  }

  async findAllByCourse(courseId: string) {
    return this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        materials: true,
        assignments: true,
        quizzes: true,
        labs: true,
      },
    });
  }

  async findOne(id: string) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id },
      include: {
        materials: true,
        assignments: true,
        quizzes: true,
        labs: true,
      },
    });
    if (!mod) throw new NotFoundException('Module not found');
    return mod;
  }

  async update(id: string, title: string, description: string | undefined, instructorId: string, role: string) {
    const mod = await this.prisma.courseModule.findUnique({ where: { id }, include: { course: true } });
    if (!mod) throw new NotFoundException('Module not found');
    if (role !== 'ADMIN' && mod.course.instructorId !== instructorId) throw new ForbiddenException('Not authorized');

    return this.prisma.courseModule.update({
      where: { id },
      data: { title, description },
    });
  }

  async remove(id: string, instructorId: string, role: string) {
    const mod = await this.prisma.courseModule.findUnique({ where: { id }, include: { course: true } });
    if (!mod) throw new NotFoundException('Module not found');
    if (role !== 'ADMIN' && mod.course.instructorId !== instructorId) throw new ForbiddenException('Not authorized');

    return this.prisma.courseModule.delete({ where: { id } });
  }
}
