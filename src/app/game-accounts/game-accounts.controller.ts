import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  findAll() {
    return this.gameAccountsService.findAll();
  }

  // GET ONE
  @Get(':id')
  findOne(@Param('id') id: string) {
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
        storage: diskStorage({
          destination: './uploads',

          filename: (req, file, callback) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);

            callback(null, unique + extname(file.originalname));
          },
        }),
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
