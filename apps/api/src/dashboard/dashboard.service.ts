import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStudentStats(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                quizzes: { select: { id: true } },
                assignments: { select: { id: true } }
              }
            }
          }
        }
      }
    });

    let totalItems = 0;
    let completedItems = 0;

    const quizSubmissions = await this.prisma.quizSubmission.findMany({ where: { studentId } });
    const assignmentSubmissions = await this.prisma.assignmentSubmission.findMany({ where: { studentId } });

    const submittedQuizIds = new Set(quizSubmissions.map(q => q.quizId));
    const submittedAssignmentIds = new Set(assignmentSubmissions.map(a => a.assignmentId));

    const coursesWithProgress = enrollments.map(en => {
      let courseTotal = 0;
      let courseCompleted = 0;

      for (const m of en.course.modules) {
        courseTotal += m.quizzes.length + m.assignments.length;
        m.quizzes.forEach(q => { if (submittedQuizIds.has(q.id)) courseCompleted++; });
        m.assignments.forEach(a => { if (submittedAssignmentIds.has(a.id)) courseCompleted++; });
      }

      totalItems += courseTotal;
      completedItems += courseCompleted;

      const progress = courseTotal > 0 ? Math.round((courseCompleted / courseTotal) * 100) : 0;

      return {
        id: en.course.id,
        title: en.course.title,
        progress
      };
    });

    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Get Upcoming Deadlines
    const upcomingAssignments = await this.prisma.assignment.findMany({
      where: {
        module: { course: { enrollments: { some: { userId: studentId } } } },
        submissions: { none: { studentId } },
        deadline: { gt: new Date() }
      },
      take: 3,
      orderBy: { deadline: 'asc' },
      include: { module: { include: { course: { select: { title: true } } } } }
    });

    return {
      overallProgress,
      completedModules: completedItems, // we just use completed items for display
      coursesWithProgress,
      upcomingDeadlines: upcomingAssignments.map(a => ({
        id: a.id,
        title: a.title,
        courseName: a.module.course.title,
        deadline: a.deadline
      }))
    };
  }

  async getLecturerStats(lecturerId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId: lecturerId },
      include: {
        _count: { select: { enrollments: true } }
      }
    });

    const totalStudents = courses.reduce((acc, curr) => acc + curr._count.enrollments, 0);

    const pendingAssignments = await this.prisma.assignmentSubmission.count({
      where: {
        status: 'PENDING',
        assignment: { module: { course: { instructorId: lecturerId } } }
      }
    });

    return {
      activeCourses: courses.length,
      totalStudents,
      pendingSubmissions: pendingAssignments
    };
  }

  async getLabs(userId: string, userRole: string) {
    if (userRole === 'LECTURER' || userRole === 'ADMIN') {
      const courses = await this.prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          instructor: { select: { name: true } },
          modules: { include: { labs: true } }
        }
      });
      const labs: any[] = [];
      for (const c of courses) {
        for (const m of c.modules) {
          for (const l of m.labs) {
            labs.push({
              id: l.id,
              title: l.title,
              instructions: l.instructions,
              courseName: c.title,
              instructor: c.instructor.name,
              status: 'active'
            });
          }
        }
      }
      return labs;
    }

    // Student
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            modules: { include: { labs: true } }
          }
        }
      }
    });

    const labs: any[] = [];
    const submissions = await this.prisma.labSubmission.findMany({ where: { studentId: userId } });
    const subMap = new Map();
    for (const s of submissions) subMap.set(s.labId, s);

    for (const en of enrollments) {
      for (const m of en.course.modules) {
        for (const l of m.labs) {
          const sub = subMap.get(l.id);
          labs.push({
            id: l.id,
            title: l.title,
            instructions: l.instructions,
            courseName: en.course.title,
            instructor: en.course.instructor.name,
            status: sub ? (sub.status === 'GRADED' ? 'completed' : 'pending') : 'available',
            score: sub?.score || null
          });
        }
      }
    }
    return labs;
  }
}
