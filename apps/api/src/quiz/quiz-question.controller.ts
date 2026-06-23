import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('quiz-questions')
export class QuizQuestionController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        optionA: { type: 'string' },
        optionB: { type: 'string' },
        optionC: { type: 'string' },
        optionD: { type: 'string' },
        correctAnswer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
        quizId: { type: 'string' },
      },
      required: [
        'question',
        'optionA',
        'optionB',
        'optionC',
        'optionD',
        'correctAnswer',
        'quizId',
      ],
    },
  })
  create(
    @Body()
    data: {
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
      quizId: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.quizService.createQuestion(req.user.id, req.user.role, data);
  }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        optionA: { type: 'string' },
        optionB: { type: 'string' },
        optionC: { type: 'string' },
        optionD: { type: 'string' },
        correctAnswer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body()
    data: {
      question?: string;
      optionA?: string;
      optionB?: string;
      optionC?: string;
      optionD?: string;
      correctAnswer?: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.quizService.updateQuestion(id, req.user.id, req.user.role, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.quizService.deleteQuestion(id, req.user.id, req.user.role);
  }
}
