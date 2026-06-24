import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleDeadlineNotifications() {
    this.logger.debug('Running deadline notification check...');
    
    const assignments = await this.prisma.assignment.findMany({
      where: {
        deadline: { gt: new Date() },
        status: { not: 'DRAFT' }
      },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  include: { user: true }
                }
              }
            }
          }
        },
        submissions: true,
      }
    });

    const now = new Date();

    for (const assignment of assignments) {
      const deadline = new Date(assignment.deadline);
      const diffMs = deadline.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      let notificationType: string | null = null;
      let timeLabel = '';

      if (diffHours <= 48 && diffHours > 47) {
        notificationType = 'H-2_DAYS';
        timeLabel = '2 Hari';
      } else if (diffHours <= 24 && diffHours > 23) {
        notificationType = 'H-1_DAY';
        timeLabel = '1 Hari';
      } else if (diffHours <= 5 && diffHours > 4.5) {
        notificationType = 'H-5_HOURS';
        timeLabel = '5 Jam';
      } else if (diffHours <= 1 && diffHours > 0.5) {
        notificationType = 'H-1_HOUR';
        timeLabel = '1 Jam';
      }

      if (notificationType) {
        for (const enrollment of assignment.module.course.enrollments) {
          const studentId = enrollment.user.id;
          const hasSubmitted = assignment.submissions.some(s => s.studentId === studentId);
          
          if (!hasSubmitted) {
            const title = `Peringatan Deadline: ${timeLabel} menuju batas waktu ${assignment.title}`;
            const existingNotif = await this.prisma.notification.findFirst({
              where: { userId: studentId, title }
            });

            if (!existingNotif) {
              await this.prisma.notification.create({
                data: {
                  userId: studentId,
                  title,
                  message: `Tugas "${assignment.title}" pada mata kuliah ${assignment.module.course.title} akan jatuh tempo dalam ${timeLabel}. Segera kumpulkan tugas Anda!`,
                  isRead: false
                }
              });
              this.logger.log(`Sent ${notificationType} notification to user ${studentId} for assignment ${assignment.id}`);
            }
          }
        }
      }
    }
  }
}
