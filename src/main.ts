import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { LoggerModule } from './logger/logger.module';
import { initApp } from './init';
// 🔥 1. IMPORT THƯ VIỆN SWAGGER VÀO ĐÂY
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // ================= CẤU HÌNH CORS ĐÃ CẬP NHẬT =================
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // =======================================================

  app.setGlobalPrefix(APP_PREFIX);

  const HOST =
    NODE_ENV === 'production' ? '0.0.0.0' : process.env.HOST || 'localhost';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.log('VALIDATION ERRORS:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  // 🔥 2. ĐOẠN CẤU HÌNH TÀI LIỆU API DOCS (SWAGGER)
  const config = new DocumentBuilder()
    .setTitle('API Hệ Thống Shop Nick Game')
    .setDescription(
      'Tài liệu hướng dẫn kết nối API tích hợp nạp thẻ và mua acc tự động',
    )
    .setVersion('1.0')
    .addBearerAuth() // Bật tính năng truyền Token khóa bảo mật khi test API đăng nhập
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Đường dẫn truy cập trang tài liệu sẽ là: domain/api/docs
  SwaggerModule.setup('api/docs', app, document);
  // =======================================================

  initApp(app);

  await app.listen(PORT, HOST);

  const protocol = NODE_ENV === 'production' ? 'https' : 'http';

  Logger.log(
    `Service is running at ${protocol}://${HOST}:${PORT}${APP_PREFIX}`,
    APP_NAME,
  );
}

void bootstrap();
