import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/register — Mendaftarkan akun baru
  @Post('register')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string', enum: ['STUDENT', 'LECTURER', 'ADMIN'] },
        angkatan: { type: 'integer', description: 'Tahun angkatan mahasiswa (hanya untuk role STUDENT)' },
        semester: { type: 'integer', description: 'Semester mahasiswa (hanya untuk role STUDENT)' },
      },
    },
  })
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role: 'STUDENT' | 'LECTURER' | 'ADMIN';
      angkatan?: number;
      semester?: number;
    },
  ) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
      body.role,
      body.angkatan,
      body.semester,
    );
  }

  // POST /auth/login — Masuk ke akun dan dapatkan JWT Token
  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' }, password: { type: 'string' } },
    },
  })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // POST /auth/forgot-password — Simulasi lupa password
  @Post('forgot-password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' } },
    },
  })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  // GET /auth/profile — Dapatkan profil user yang sedang login
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { id: string; role: string } }) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req: { user: { id: string; role: string } },
    @Body()
    body: { name?: string; password?: string; email?: string; role?: string; semester?: number },
  ) {
    // Validasi ketat: email dan role diabaikan jika dikirim
    return this.authService.updateProfile(req.user.id, {
      name: body.name,
      password: body.password,
      semester: body.semester,
    });
  }
}
