import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getEvents(userId: string, role: string) {
    if (role === 'STUDENT') {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  assignments: {
                    where: { status: { not: 'DRAFT' } }
                  }
                }
              }
            }
          }
        }
      });

      const events: any[] = [];
      for (const enrollment of enrollments) {
        for (const module of enrollment.course.modules) {
          for (const assignment of module.assignments) {
            events.push({
              id: assignment.id,
              title: assignment.title,
              start: assignment.deadline,
              end: assignment.deadline,
              courseName: enrollment.course.title,
              type: 'assignment'
            });
          }
        }
      }
      return events;
    } else if (role === 'LECTURER' || role === 'ADMIN') {
      const courses = await this.prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          modules: {
            include: {
              assignments: true
            }
          }
        }
      });

      const events: any[] = [];
      for (const course of courses) {
        for (const module of course.modules) {
          for (const assignment of module.assignments) {
            events.push({
              id: assignment.id,
              title: assignment.title,
              start: assignment.deadline,
              end: assignment.deadline,
              courseName: course.title,
              type: 'assignment'
            });
          }
        }
      }
      return events;
    }

    return [];
  }
}
