import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { LoggerModule } from './logger/logger.module';
import { initApp } from './init';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerModule.createLogger(),
  });

  const {
    PORT = 3000,
    APP_PREFIX = '/api',
    APP_NAME = 'nestjs_app',
    NODE_ENV = 'development',
  } = process.env;

  // SỬA TẠI ĐÂY: Nếu là môi trường production trên Render, ép HOST phải là '0.0.0.0'
  const HOST =
    NODE_ENV === 'production' ? '0.0.0.0' : process.env.HOST || 'localhost';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,

      // hiện lỗi validation chi tiết
      exceptionFactory: (errors) => {
        console.log('VALIDATION ERRORS:', JSON.stringify(errors, null, 2));

        return new BadRequestException(errors);
      },
    }),
  );

  initApp(app);

  await app.listen(PORT, HOST);

  const protocol = NODE_ENV === 'production' ? 'https' : 'http';

  Logger.log(
    `Service is running at ${protocol}://${HOST}:${PORT}${APP_PREFIX}`,
    APP_NAME,
  );
}

void bootstrap();
