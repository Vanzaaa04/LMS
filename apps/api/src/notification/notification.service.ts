import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async createGlobalNotification(title: string, message: string, senderId?: string) {
    let finalMessage = message;
    
    if (senderId) {
      const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
      if (sender) {
        const prefix = sender.role === 'ADMIN' ? `[Admin Pusat - ${sender.name}]` : `[Dosen - ${sender.name}]`;
        finalMessage = `${prefix}\n\n${message}`;
      }
    }

    // Get all users
    const users = await this.prisma.user.findMany({ select: { id: true } });
    
    // Insert notification for all users
    const data = users.map(u => ({
      userId: u.id,
      title,
      message: finalMessage,
      isRead: false
    }));

    return this.prisma.notification.createMany({
      data,
    });
  }

  async createCohortNotification(courseId: string, title: string, message: string) {
    // 1. Dapatkan instructorId dari Course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) return;

    // 2. Dapatkan seluruh userId dari Enrollment kelas tersebut
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true }
    });

    // 3. Gabungkan seluruh ID penerima (dosen pengajar + mahasiswa terdaftar)
    const userIds = new Set<string>();
    userIds.add(course.instructorId);
    enrollments.forEach(e => userIds.add(e.userId));

    // 4. Masukkan notifikasi ke database
    const data = Array.from(userIds).map(uid => ({
      userId: uid,
      title,
      message,
      isRead: false
    }));

    if (data.length > 0) {
      return this.prisma.notification.createMany({
        data,
      });
    }
  }

  async createAdminNotification(title: string, message: string) {
    // Cari semua user dengan peran ADMIN
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const data = admins.map(a => ({
      userId: a.id,
      title,
      message,
      isRead: false
    }));

    if (data.length > 0) {
      return this.prisma.notification.createMany({
        data,
      });
    }
  }
}
