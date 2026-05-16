import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

import { SettingsService } from './settings.service';

import { UpdateSettingDto } from './dto/update-setting.dto';

import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateSettingDto) {
    return this.settingsService.updateSettings(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async uploadImage(
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const logoFile = files.logo?.[0];
    const bannerFile = files.banner?.[0];

    let logoUrl = '';
    let bannerUrl = '';

    // upload logo
    if (logoFile) {
      const result = await this.cloudinaryService.uploadImage(logoFile);

      logoUrl = result.secure_url;
    }

    // upload banner
    if (bannerFile) {
      const result = await this.cloudinaryService.uploadImage(bannerFile);

      bannerUrl = result.secure_url;
    }

    // save database
    const settings = await this.settingsService.updateSettings({
      logo: logoUrl,
      banner: bannerUrl,
    });

    return {
      message: 'Upload thành công',
      settings,
    };
  }
}
