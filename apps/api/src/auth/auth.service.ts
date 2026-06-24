import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // === REGISTER: Mendaftarkan user baru ===
  async register(
    name: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'LECTURER' | 'ADMIN',
    angkatan?: number,
    semester?: number,
  ) {
    // Cek apakah email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // Hash password agar tidak tersimpan mentah di database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        // Hanya simpan angkatan jika role adalah STUDENT
        angkatan: role === 'STUDENT' ? (angkatan ?? null) : null,
        semester: role === 'STUDENT' ? (semester ?? 1) : null,
      },
    });

    // Notify all ADMIN users about new registration
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (admins.length > 0) {
      const notifData = admins.map(a => ({
        userId: a.id,
        title: 'Pengguna Baru Terdaftar',
        message: `Pengguna baru bernama ${name} (${email}) dengan peran ${role} telah mendaftar.`,
        isRead: false
      }));
      await this.prisma.notification.createMany({
        data: notifData
      });
    }

    // Kembalikan data user tanpa password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // === LOGIN: Verifikasi user dan berikan JWT Token ===
  async login(email: string, password: string) {
    // Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email tidak ditemukan');
    }

    // Cocokkan password yang diketik dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password salah');
    }

    // Buat JWT Token berisi ID dan Role user
    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        maxCredits: user.maxCredits,
        angkatan: user.angkatan,
      },
    };
  }

  // === FORGOT PASSWORD: Simulasi pengiriman email reset password ===
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Untuk alasan keamanan, biasanya kita tidak memberitahu bahwa email tidak ditemukan.
      // Namun untuk simulasi ini kita lempar error.
      throw new NotFoundException('Email tidak terdaftar di sistem.');
    }

    // SIMULASI: Generate reset token dan "kirim email"
    const mockResetToken = `RESET-${user.id}-${Date.now()}`;
    
    console.log(`\n======================================================`);
    console.log(`[SIMULASI EMAIL] - LUPA PASSWORD`);
    console.log(`Ke: ${email}`);
    console.log(`Subjek: Reset Password AFADIA Academy`);
    console.log(`Halo ${user.name},`);
    console.log(`Klik link berikut untuk mereset password Anda:`);
    console.log(`http://localhost:3000/reset-password?token=${mockResetToken}`);
    console.log(`======================================================\n`);

    return {
      message: 'Simulasi email reset password telah dikirim.',
      status: 'success'
    };
  }

  // === PROFILE: Get User Profile ===
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        maxCredits: true,
        angkatan: true,
        semester: true,
        createdAt: true,
        enrollments: {
          select: {
            course: {
              select: {
                credits: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const usedCredits = user.enrollments.reduce(
      (totalCredits, enrollment) => totalCredits + enrollment.course.credits,
      0,
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      maxCredits: user.maxCredits,
      angkatan: user.angkatan,
      semester: user.semester,
      usedCredits,
      remainingCredits: Math.max(user.maxCredits - usedCredits, 0),
      createdAt: user.createdAt,
    };
  }

  // === PROFILE: Update User Profile ===
  async updateProfile(
    userId: string,
    data: { name?: string; password?: string; semester?: number },
  ) {
    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.semester !== undefined) {
      updateData.semester = data.semester;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
