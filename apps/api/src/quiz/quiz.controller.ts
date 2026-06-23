import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiTags('Quizzes')
@ApiBearerAuth('JWT-auth')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        moduleId: { type: 'string' },
        xpReward: { type: 'number' },
        passingScore: { type: 'number' },
        timeLimit: { type: 'number' },
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
      },
    },
  })
  create(
    @Body()
    data: {
      title: string;
      moduleId: string;
      xpReward: number;
      passingScore: number;
      timeLimit?: number;
      status?: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.quizService.create(req.user.id, req.user.role, data);
  }

  @Get()
  findAll(@Query('courseId') courseId?: string, @Query('moduleId') moduleId?: string) {
    return this.quizService.findAll({ courseId, moduleId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        timeLimit: { type: 'number' },
        xpReward: { type: 'number' },
        passingScore: { type: 'number' },
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      timeLimit?: number;
      xpReward?: number;
      passingScore?: number;
      status?: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.quizService.update(id, req.user.id, req.user.role, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.quizService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/submit')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              answer: { type: 'string' },
            },
          },
        },
      },
    },
  })
  submit(
    @Param('id') id: string,
    @Body() data: { answers: { questionId: string; answer: string }[] },
    @Request() req: { user: { id: string } },
  ) {
    return this.quizService.submit(id, req.user.id, data.answers);
  }

  @Get(':id/questions')
  getQuestions(@Param('id') id: string) {
    return this.quizService.getQuestionsForQuiz(id);
  }

  @Post(':id/questions')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        optionA: { type: 'string' },
        optionB: { type: 'string' },
        optionC: { type: 'string' },
        optionD: { type: 'string' },
        correctAnswer: { type: 'string' },
      },
    },
  })
  createQuestion(
    @Param('id') id: string,
    @Body()
    data: {
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctAnswer: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.quizService.createQuestion(req.user.id, req.user.role, { ...data, quizId: id });
  }

  @Patch('questions/:questionId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        optionA: { type: 'string' },
        optionB: { type: 'string' },
        optionC: { type: 'string' },
        optionD: { type: 'string' },
        correctAnswer: { type: 'string' },
      },
    },
  })
  updateQuestion(
    @Param('questionId') questionId: string,
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
    return this.quizService.updateQuestion(questionId, req.user.id, req.user.role, data);
  }

  @Delete('questions/:questionId')
  removeQuestion(
    @Param('questionId') questionId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.quizService.deleteQuestion(questionId, req.user.id, req.user.role);
  }

  @Get(':id/submission')
  getSubmission(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.quizService.getSubmission(id, req.user.id);
  }

  @Get(':id/submissions')
  getSubmissionsList(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.quizService.getSubmissionsList(id, req.user.id, req.user.role);
  }
}
