import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { LoggingInterceptor } from 'src/logger/logging.interceptor';
import { LoggerModule } from 'src/logger/logger.module';
import { ApiUtilModule } from 'src/utils/api-util/api-util.module';
import { CatchEverythingFilter } from 'src/catch-everything/catch-everything.filter';
import { ZodExceptionFilter } from 'src/catch-everything/zod-exception/zod-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { GameAccountsModule } from './game-accounts/game-accounts.module';
import { GamesModule } from './games/games.module';
import { SettingsModule } from './settings/settings.module';
import { CardModule } from './card/card.module';
import { CategoryGroupsModule } from './category-groups/category-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      // validate: validate,
    }),
    LoggerModule,
    UsersModule,
    ApiUtilModule,
    PrismaModule,
    AuthModule,
    GamesModule,
    GameAccountsModule,
    SettingsModule,
    CardModule,
    CategoryGroupsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    ZodExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
