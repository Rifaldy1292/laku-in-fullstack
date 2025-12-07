import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { applicationLogger } from './utils/logger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applicationLogger.info('Inisialisasi server NestJS dimulai...');
  app.use(cookieParser());
  app.enableCors({
    origin: [process.env.CORS_ORIGIN],
    credentials: true,
  });
  // Tambahkan ini untuk validasi DTO secara global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // buang field yang tidak ada di DTO
      forbidNonWhitelisted: true, // kembalikan error kalau ada field tambahan
      transform: true, // otomatis convert string ke number/Date sesuai DTO
    }),
  );
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
