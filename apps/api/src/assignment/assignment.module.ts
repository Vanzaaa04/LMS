import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../prisma.service';
import { AssignmentSubmissionController } from './assignment-submission.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AssignmentController, AssignmentSubmissionController],
  providers: [AssignmentService, PrismaService],
})
export class AssignmentModule {}
