import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/');

  await app.listen(envs.PORT ?? 3000);
  console.log(`Gateway running on port ${envs.PORT ?? 3000}`);
}
bootstrap().catch((err) => {
  console.error('💥 Error fatal durante el bootstrap:', err);
  process.exit(1);
});
