import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { CategoryGroupsService } from './category-groups.service';

import { CreateCategoryGroupDto } from './dto/create-category-group.dto';
import { UpdateCategoryGroupDto } from './dto/update-category-group.dto';

import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller()
export class CategoryGroupsController {
  constructor(
    private readonly categoryGroupsService: CategoryGroupsService,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('admin/category-groups')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCategoryGroupDto,
    @Req() req: Request,
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);

      dto.thumbnailUrl = result.secure_url;
    }

    return this.categoryGroupsService.create(dto, (req as any).user.userId);
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
