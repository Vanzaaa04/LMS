import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LabSubmissionService } from './lab-submission.service';

/**
 * Controller untuk Lab Submission & Grading.
 * Tanpa prefix di @Controller() agar bisa menulis path lengkap di setiap route,
 * karena endpoint memiliki awalan URL yang berbeda-beda:
 * - /labs/... untuk submit dan lihat submission
 * - /lab-submissions/... untuk grading
 */
@ApiBearerAuth('JWT-auth')
@ApiTags('Lab Submission')
@Controller()
export class LabSubmissionController {
  constructor(private readonly labSubmissionService: LabSubmissionService) {}

  /**
   * POST /labs/:id/submit
   * Mahasiswa mengumpulkan hasil praktikum.
   * Memerlukan JWT token (autentikasi mahasiswa).
   */
  @UseGuards(JwtAuthGuard)
  @Post('labs/:id/submit')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['fileUrl'],
      properties: {
        fileUrl: { type: 'string', description: 'Link file hasil praktikum' },
        note: { type: 'string', description: 'Catatan tambahan (opsional)' },
      },
    },
  })
  async submit(
    @Param('id') labId: string,
    @Body() data: { fileUrl: string; note?: string },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.labSubmissionService.submit(labId, req.user.id, data);
  }

  /**
   * GET /labs/:id/submissions
   * Dosen melihat daftar mahasiswa yang sudah mengumpulkan hasil praktikum.
   * Memerlukan JWT token (autentikasi dosen).
   */
  @UseGuards(JwtAuthGuard)
  @Get('labs/:id/submissions')
  async getSubmissions(@Param('id') labId: string, @Request() req: { user: { id: string; role: string } }) {
    return this.labSubmissionService.getSubmissions(labId, req.user.id, req.user.role);
  }

  /**
   * PUT /lab-submissions/:id/grade
   * Dosen memberikan nilai dan feedback untuk submission mahasiswa.
   * Memerlukan JWT token (autentikasi dosen).
   */
  @UseGuards(JwtAuthGuard)
  @Put('lab-submissions/:id/grade')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['score'],
      properties: {
        score: { type: 'number', description: 'Nilai 0-100' },
        feedback: {
          type: 'string',
          description: 'Komentar evaluatif (opsional)',
        },
      },
    },
  })
  async grade(
    @Param('id') submissionId: string,
    @Body() data: { score: number; feedback?: string },
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.labSubmissionService.grade(submissionId, req.user.id, data, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('labs/:id/my-submission')
  async getMySubmission(@Param('id') labId: string, @Request() req: { user: { id: string } }) {
    return this.labSubmissionService.getMySubmission(labId, req.user.id);
  }
}
