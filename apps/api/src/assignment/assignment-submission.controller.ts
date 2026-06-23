import {
  Body,
  Controller,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('assignment-submissions')
export class AssignmentSubmissionController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Put(':id/grade')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { score: { type: 'number' }, feedback: { type: 'string' } },
    },
  })
  async grade(
    @Param('id') id: string,
    @Body() data: { score: number; feedback?: string },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.assignmentService.gradeSubmission(id, req.user.id, data, req.user.role);
  }
}
