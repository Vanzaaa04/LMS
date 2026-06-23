import os, re

def fix_api_package():
    with open('apps/api/package.json', 'r', encoding='utf-8') as f:
        text = f.read()
    text = re.sub(r'<<<<<<< HEAD.*?=======.*?"@nestjs/platform-express": "\^11\.1\.22",\s*"@nestjs/swagger": "\^11\.4\.4",\s*>>>>>>> [^\n]+', 
                  '    "@nestjs/platform-express": "^11.1.24",\n    "@nestjs/swagger": "^11.4.4",', text, flags=re.DOTALL)
    with open('apps/api/package.json', 'w', encoding='utf-8') as f: f.write(text)

def fix_app_module():
    mod = """import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { CourseModule } from './course/course.module';
import { AssignmentModule } from './assignment/assignment.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AdminModule } from './admin/admin.module';
import { MaterialModule } from './material/material.module';
import { LabSubmissionModule } from './lab-submission/lab-submission.module';
import { LabModule } from './lab/lab.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    QuizModule,
    CourseModule,
    AssignmentModule,
    LeaderboardModule,
    AdminModule,
    MaterialModule,
    LabSubmissionModule,
    LabModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
"""
    with open('apps/api/src/app.module.ts', 'w', encoding='utf-8') as f: f.write(mod)

def fix_assignment_module():
    mod = """import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../prisma.service';
import { AssignmentSubmissionController } from './assignment-submission.controller';

@Module({
  controllers: [AssignmentController, AssignmentSubmissionController],
  providers: [AssignmentService, PrismaService],
})
export class AssignmentModule {}
"""
    with open('apps/api/src/assignment/assignment.module.ts', 'w', encoding='utf-8') as f: f.write(mod)

def strip_markers(filepath, replacement_header):
    with open(filepath, 'r', encoding='utf-8') as f: text = f.read()
    text = re.sub(r'<<<<<<< HEAD.*?=======.*?>>>>>>> [^\n]+\n', '', text, flags=re.DOTALL)
    body = text[text.find('@Injectable()'):]
    with open(filepath, 'w', encoding='utf-8') as f: f.write(replacement_header + body)

def fix_services():
    strip_markers('apps/api/src/assignment/assignment.service.ts', 
        "import {\n  Injectable,\n  NotFoundException,\n  ForbiddenException,\n  BadRequestException,\n} from '@nestjs/common';\nimport { PrismaService } from '../prisma.service';\nimport { Assignment } from '@prisma/client';\n\n")
    strip_markers('apps/api/src/course/course.service.ts', 
        "import {\n  Injectable,\n  NotFoundException,\n  ForbiddenException,\n  ConflictException,\n  BadRequestException,\n} from '@nestjs/common';\nimport { PrismaService } from '../prisma.service';\nimport { Course } from '@prisma/client';\n\n")
    strip_markers('apps/api/src/quiz/quiz.service.ts', 
        "import {\n  ForbiddenException,\n  Injectable,\n  NotFoundException,\n} from '@nestjs/common';\nimport { PrismaService } from '../prisma.service';\n\n")

def fix_globals():
    with open('apps/web/app/globals.css', 'r', encoding='utf-8') as f: css = f.read()
    css = re.sub(r'<<<<<<< HEAD\n|=======\n|>>>>>>> [^\n]+\n', '', css)
    with open('apps/web/app/globals.css', 'w', encoding='utf-8') as f: f.write(css)

def fix_web():
    layout = """import type { Metadata } from "next";
import { Geist, Geist_Mono, Work_Sans, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ruang Dosen",
  description: "Platform pembelajaran mata kuliah untuk mahasiswa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} ${workSans.variable} ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>{children}</body>
    </html>
  );
}
"""
    with open('apps/web/app/layout.tsx', 'w', encoding='utf-8') as f: f.write(layout)
    
    page = "import { redirect } from 'next/navigation';\n\nexport default function RootPage() {\n  // Arahkan pengunjung dari halaman utama (/) langsung ke halaman login (/login)\n  redirect('/login');\n}\n"
    with open('apps/web/app/page.tsx', 'w', encoding='utf-8') as f: f.write(page)
    
    next_cfg = """import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/courses', destination: '/labs', permanent: true },
      { source: '/schedule', destination: '/labs', permanent: true },
    ];
  },
};

export default nextConfig;
"""
    with open('apps/web/next.config.ts', 'w', encoding='utf-8') as f: f.write(next_cfg)

try:
    fix_api_package()
    fix_app_module()
    fix_assignment_module()
    fix_services()
    fix_globals()
    fix_web()
    print("Conflict resolution applied!")
except Exception as e:
    print(f"Error: {e}")
