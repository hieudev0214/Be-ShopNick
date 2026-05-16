// src/app/card/card.controller.ts

import { Body, Controller, Get, Post, Put } from '@nestjs/common';

import { CardService } from './card.service';

import { RechargeCardDto } from './dto/recharge-card.dto';

import { CallbackCardDto } from './dto/callback-card.dto';

import { UpdateCardConfigDto } from './dto/update-card-config.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  // =====================================
  // NẠP THẺ
  // =====================================
  @Post('recharge')
  recharge(@Body() body: RechargeCardDto) {
    return this.cardService.recharge(body);
  }

  // =====================================
  // CALLBACK
  // =====================================
  @Post('callback')
  callback(@Body() body: CallbackCardDto) {
    return this.cardService.callback(body);
  }

  // =====================================
  // GET CONFIG
  // =====================================
  @Get('config')
  getConfig() {
    return this.cardService.getConfig();
  }

  // =====================================
  // UPDATE CONFIG
  // =====================================
  @Put('config')
  updateConfig(
    @Body()
    body: UpdateCardConfigDto,
  ) {
    return this.cardService.updateConfig(body);
  }

  // =====================================
  // LỊCH SỬ
  // =====================================
  @Get('histories')
  histories() {
    return this.cardService.histories();
  }
}
