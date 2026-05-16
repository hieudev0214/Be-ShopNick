import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CategoryGroupsService } from './category-groups.service';

import { CreateCategoryGroupDto } from './dto/create-category-group.dto';
import { UpdateCategoryGroupDto } from './dto/update-category-group.dto';

import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';

@Controller()
export class CategoryGroupsController {
  constructor(
    private readonly categoryGroupsService: CategoryGroupsService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ================= CREATE =================
  @Post('admin/category-groups')
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  async create(
    @UploadedFile() file: Express.Multer.File,

    @Body() dto: CreateCategoryGroupDto,
  ) {
    // upload cloudinary
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);

      dto.thumbnailUrl = result.secure_url;
    }

    return this.categoryGroupsService.create(dto);
  }

  // ================= UPDATE =================
  @Patch('admin/category-groups/:id')
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  async update(
    @Param('id') id: string,

    @UploadedFile() file: Express.Multer.File,

    @Body() dto: UpdateCategoryGroupDto,
  ) {
    // upload cloudinary
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);

      dto.thumbnailUrl = result.secure_url;
    }

    return this.categoryGroupsService.update(id, dto);
  }

  @Get('admin/category-groups/:id')
  findOne(@Param('id') id: string) {
    return this.categoryGroupsService.findOne(id);
  }

  // ================= DELETE =================
  @Delete('admin/category-groups/:id')
  delete(@Param('id') id: string) {
    return this.categoryGroupsService.delete(id);
  }

  // ================= ADMIN LIST =================
  @Get('admin/category-groups')
  adminList() {
    return this.categoryGroupsService.adminList();
  }

  // ================= PUBLIC =================
  @Get('games/:slug/groups')
  publicByGame(@Param('slug') slug: string) {
    return this.categoryGroupsService.publicByGame(slug);
  }
}
