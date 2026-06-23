import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Request,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CourseService } from './course.service';
import { Course } from '@prisma/client';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        instructorId: { type: 'string' },
        credits: { type: 'number', example: 3 },
        department: { type: 'string', example: 'Computer Science' },
        semester: { type: 'string', example: 'Fall Semester 2026' },
        teachingFormat: { type: 'string', example: 'Teori dan Praktikum' },
        enrollmentCap: { type: 'number', example: 60 },
        status: { type: 'string', example: 'Active' },
        targetSemester: { type: 'number', example: 1 },
        targetAngkatan: { type: 'number', example: 2024 },
      },
    },
  })
  async create(
    @Body()
    data: {
      title: string;
      description?: string;
      instructorId: string;
      credits?: number;
      department?: string;
      semester?: string;
      teachingFormat?: string;
      enrollmentCap?: number;
      status?: string;
      targetSemester?: number;
      targetAngkatan?: number;
    },
  ): Promise<Course> {
    return this.courseService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll')
  async enroll(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.courseService.enroll(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/enroll-student')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' } },
    },
  })
  async enrollStudentByEmail(
    @Param('id') id: string,
    @Body() data: { email: string },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.courseService.enrollStudentByEmail(id, data.email, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/enrollment/:studentId')
  async removeEnrollment(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.courseService.removeEnrollment(id, studentId, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/enrollments')
  async getEnrollments(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.courseService.getEnrollments(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    return this.courseService.findAll(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyCourses(@Request() req: { user: { id: string; role: string } }) {
    return this.courseService.getMyCourses(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        credits: { type: 'number', example: 3 },
        department: { type: 'string', example: 'Computer Science' },
        semester: { type: 'string', example: 'Fall Semester 2026' },
        teachingFormat: { type: 'string', example: 'Teori dan Praktikum' },
        enrollmentCap: { type: 'number', example: 60 },
        status: { type: 'string', example: 'Active' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body()
    updateCourseDto: {
      title?: string;
      description?: string;
      credits?: number;
      department?: string;
      semester?: string;
      teachingFormat?: string;
      enrollmentCap?: number;
      status?: string;
    },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.courseService.update(id, updateCourseDto, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.courseService.remove(id, req.user.id, req.user.role);
  }
}
