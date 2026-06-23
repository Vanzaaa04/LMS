import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard() {
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { xp: 'desc' },
      select: {
        id: true,
        name: true,
        xp: true,
      },
    });

    return students.map((student, index) => ({
      position: index + 1,
      ...student,
    }));
  }
}
