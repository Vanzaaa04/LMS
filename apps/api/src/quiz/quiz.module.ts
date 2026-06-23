import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizQuestionController } from './quiz-question.controller';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [QuizController, QuizQuestionController],
  providers: [QuizService, PrismaService],
})
export class QuizModule {}
