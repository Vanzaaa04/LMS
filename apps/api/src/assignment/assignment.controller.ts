import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssignmentService } from './assignment.service';
import { Assignment } from '@prisma/client';

@ApiTags('Assignments')
@ApiBearerAuth('JWT-auth')
@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['DRAFT', 'ACTIVE'] },
        deadline: { type: 'string', format: 'date-time' },
        templateUrl: { type: 'string' },
        templateName: { type: 'string' },
        submissionRequirement: { type: 'string' },
        moduleId: { type: 'string' },
      },
    },
  })
  async create(
    @Body()
    data: {
      title: string;
      description: string;
      status?: string;
      deadline: string;
      templateUrl?: string;
      templateName?: string;
      submissionRequirement?: string;
      moduleId: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ): Promise<Assignment> {
    return this.assignmentService.create(req.user.id, req.user.role, {
      ...data,
      deadline: new Date(data.deadline),
    });
  }

  @Get()
  async findAll(@Query('moduleId') moduleId?: string) {
    return this.assignmentService.findAll(moduleId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assignmentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['DRAFT', 'ACTIVE'] },
        deadline: { type: 'string', format: 'date-time' },
        templateUrl: { type: 'string' },
        templateName: { type: 'string' },
        submissionRequirement: { type: 'string' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      description?: string;
      status?: string;
      deadline?: string;
      templateUrl?: string;
      templateName?: string;
      submissionRequirement?: string;
    },
    @Request() req: any,
  ) {
    return this.assignmentService.update(id, req.user.id, req.user.role, {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.assignmentService.remove(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { fileUrl: { type: 'string' }, note: { type: 'string' } },
    },
  })
  async submit(
    @Param('id') id: string,
    @Body() data: { fileUrl: string; note?: string },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.assignmentService.submit(id, req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/submissions')
  async getSubmissions(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.assignmentService.getSubmissions(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/my-submission')
  async getMySubmission(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.assignmentService.getMySubmission(id, req.user.id);
  }
}
