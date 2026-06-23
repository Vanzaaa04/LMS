import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('student-stats')
  async getStudentStats(@Req() req: any) {
    return this.dashboardService.getStudentStats(req.user.id);
  }

  @Get('lecturer-stats')
  @UseGuards(RolesGuard)
  @Roles('LECTURER', 'ADMIN')
  async getLecturerStats(@Req() req: any) {
    return this.dashboardService.getLecturerStats(req.user.id);
  }

  @Get('labs')
  async getMyLabs(@Req() req: any) {
    return this.dashboardService.getLabs(req.user.id, req.user.role);
  }
}
