import { Module } from '@nestjs/common';
import { LabSubmissionController } from './lab-submission.controller';
import { LabSubmissionService } from './lab-submission.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LabSubmissionController],
  providers: [LabSubmissionService, PrismaService],
})
export class LabSubmissionModule {}
