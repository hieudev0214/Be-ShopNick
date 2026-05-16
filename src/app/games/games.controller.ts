import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Controller()
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('admin/games')
  create(@Body() dto: CreateGameDto) {
    return this.gamesService.create(dto);
  }

  @Patch('admin/games/:id')
  update(@Param('id') id: string, @Body() dto: UpdateGameDto) {
    return this.gamesService.update(id, dto);
  }

  @Get('admin/games')
  adminList() {
    return this.gamesService.adminList();
  }

  @Get('admin/games/:id')
  adminDetail(@Param('id') id: string) {
    return this.gamesService.adminDetail(id);
  }

  @Delete('admin/games/:id')
  delete(@Param('id') id: string) {
    return this.gamesService.delete(id);
  }

  @Get('games')
  publicList() {
    return this.gamesService.publicList();
  }

  @Get('games/:slug')
  publicDetail(@Param('slug') slug: string) {
    return this.gamesService.publicDetail(slug);
  }
}
