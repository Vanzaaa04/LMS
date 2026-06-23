import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors();

  // Serve uploaded files statically
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Mencegah error 'Payload Too Large' saat Frontend upload gambar/file (Sprint 5)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('EduLab LMS - Ruang Dosen API')
    .setDescription(
      'Dokumentasi API lengkap untuk sistem manajemen pembelajaran (LMS) Ruang Dosen.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Masukkan token JWT Anda di sini',
        in: 'header',
      },
      'JWT-auth', // This is the security name used in decorators
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep the JWT token saved even after page refresh!
    },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📖 Swagger API documentation: http://localhost:${port}/api`);
}
bootstrap();
