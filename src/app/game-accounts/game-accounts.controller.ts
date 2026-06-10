import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { extname } from 'path';

import { GameAccountsService } from './game-accounts.service';

import { CreateGameAccountDto } from './dto/create-game-account.dto';

import { UpdateGameAccountDto } from './dto/update-game-account.dto';

@Controller('admin/game-accounts')
export class GameAccountsController {
  constructor(private readonly gameAccountsService: GameAccountsService) {}

  // CREATE
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 20 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  create(
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },

    @Body()
    dto: CreateGameAccountDto,
  ) {
    return this.gameAccountsService.create(dto, files);
  }

  // GET ALL
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.gameAccountsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      groupId,
    );
  }

  @Get('product/:productCode')
  findByProductCode(@Param('productCode') productCode: string) {
    return this.gameAccountsService.findByProductCode(productCode);
  }

  // GET PRODUCTS BY GROUP SLUG
  @Get('detail/:slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.gameAccountsService.findBySlug(
      slug,
      Number(page) || 1,
      Number(limit) || 10,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      order,
    );
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('ID:', id);

    return this.gameAccountsService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 20 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  update(
    @Param('id') id: string,

    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },

    @Body()
    dto: UpdateGameAccountDto,
  ) {
    return this.gameAccountsService.update(id, dto, files);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameAccountsService.remove(id);
  }
}
