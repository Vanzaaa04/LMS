import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { CourseModule } from './course/course.module';
import { CourseModuleModule } from './module/module.module';
import { AssignmentModule } from './assignment/assignment.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AdminModule } from './admin/admin.module';
import { MaterialModule } from './material/material.module';
import { LabSubmissionModule } from './lab-submission/lab-submission.module';
import { LabModule } from './lab/lab.module';
import { UploadModule } from './upload/upload.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CalendarModule } from './calendar/calendar.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CalendarModule,
    AuthModule,
    QuizModule,
    CourseModule,
    CourseModuleModule,
    AssignmentModule,
    LeaderboardModule,
    AdminModule,
    MaterialModule,
    LabSubmissionModule,
    LabModule,
    UploadModule,
    NotificationModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
