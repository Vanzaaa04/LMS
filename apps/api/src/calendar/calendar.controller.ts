import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  async getEvents(@Req() req: any) {
    return this.calendarService.getEvents(req.user.id, req.user.role);
  }
}
