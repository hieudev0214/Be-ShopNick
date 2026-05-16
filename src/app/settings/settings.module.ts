import { Module } from '@nestjs/common';

import { SettingsController } from './settings.controller';

import { SettingsService } from './settings.service';

import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  imports: [CloudinaryModule],

  controllers: [SettingsController],

  providers: [SettingsService, PrismaService],
})
export class SettingsModule {}
