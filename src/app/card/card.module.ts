// src/app/card/card.module.ts

import { Module } from '@nestjs/common';

import { CardController } from './card.controller';

import { CardService } from './card.service';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Module({
  controllers: [CardController],

  providers: [CardService, PrismaService],
})
export class CardModule {}
