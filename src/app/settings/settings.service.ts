import { Injectable } from '@nestjs/common';

import { UpdateSettingDto } from './dto/update-setting.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    return this.prisma.settings.findUnique({
      where: {
        id: 1,
      },
    });
  }

  async updateSettings(dto: UpdateSettingDto) {
    return this.prisma.settings.upsert({
      where: {
        id: 1,
      },

      update: dto,

      create: {
        id: 1,
        ...dto,
      },
    });
  }
}
