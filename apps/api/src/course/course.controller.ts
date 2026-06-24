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
        className: { type: 'string', example: 'A' },
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
      instructorId?: string;
      className?: string;
      credits?: number;
      department?: string;
      semester?: string;
      teachingFormat?: string;
      enrollmentCap?: number;
      status?: string;
      targetSemester?: number;
      targetAngkatan?: number;
    },
    @Request() req: { user: { id: string; role: string } },
  ): Promise<Course> {
    // Only ADMIN can create courses now. Lecturers should claim existing courses.
    if (req.user.role === 'LECTURER') {
      throw new import('@nestjs/common').ForbiddenException('Lecturers are no longer allowed to create courses. Please ask the Admin to create it or claim an available class.');
    }
    return this.courseService.create(data);
  }

  // ─── Dosen Claims a Class ────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post(':id/claim')
  async claimClass(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.courseService.claimClass(id, req.user.id);
  }

  // ─── Dosen Releases a Class ──────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post(':id/release')
  async releaseClass(
    @Param('id') id: string,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.courseService.releaseClass(id, req.user.id, req.user.role);
  }

  // ─── Get Available (Unclaimed) Classes ───────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('available')
  async getAvailableClasses() {
    return this.courseService.getAvailableClasses();
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
        className: { type: 'string' },
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
  async update(
    @Param('id') id: string,
    @Body()
    updateCourseDto: {
      title?: string;
      description?: string;
      className?: string;
      credits?: number;
      department?: string;
      semester?: string;
      teachingFormat?: string;
      enrollmentCap?: number;
      status?: string;
      targetSemester?: number;
      targetAngkatan?: number;
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
