const fs = require('fs');

function fixSpecFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  if (content.includes('PrismaService')) return;
  
  if (content.includes('providers: [') || content.includes('controllers: [')) {
    const depthMatch = path.match(/\//g);
    // Depth calc: apps/api/src/...
    const parts = path.split('/');
    // e.g. apps/api/src/auth/auth.service.spec.ts -> parts length 6
    // We want relative path from auth to src. src is at parts[2].
    // so depth is parts.length - 4.
    const depth = parts.length - 4;
    const prismaPath = depth > 0 ? '../'.repeat(depth) + 'prisma.service' : './prisma.service';

    content = content.replace(/(import { Test, TestingModule } from '@nestjs\/testing';)/, "$1\nimport { PrismaService } from '" + prismaPath + "';");

    if (content.includes('providers: [')) {
      content = content.replace(/providers: \[([^\]]+)\]/, 'providers: [$1, PrismaService]');
    } else {
      content = content.replace(/controllers: \[([^\]]+)\],/, 'controllers: [$1],\n      providers: [PrismaService],');
    }
    
    if (path.includes('auth')) {
      if (!content.includes('JwtService')) {
        content = content.replace(/(import { Test, TestingModule } from '@nestjs\/testing';)/, "$1\nimport { JwtService } from '@nestjs/jwt';");
        content = content.replace(/providers: \[([^\]]+)\]/, 'providers: [$1, JwtService]');
      }
    }
    
    fs.writeFileSync(path, content);
    console.log('Fixed', path);
  }
}

const files = [
  'apps/api/src/admin/admin.controller.spec.ts',
  'apps/api/src/admin/admin.service.spec.ts',
  'apps/api/src/auth/auth.controller.spec.ts',
  'apps/api/src/auth/auth.service.spec.ts',
  'apps/api/src/course/course.controller.spec.ts',
  'apps/api/src/course/course.service.spec.ts',
  'apps/api/src/quiz/quiz.controller.spec.ts',
  'apps/api/src/quiz/quiz.service.spec.ts',
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    fixSpecFile(f);
  }
});
