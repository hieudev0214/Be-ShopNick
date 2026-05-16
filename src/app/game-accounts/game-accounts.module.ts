import { Module } from '@nestjs/common';
import { GameAccountsController } from './game-accounts.controller';
import { GameAccountsService } from './game-accounts.service';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [GameAccountsController],
  providers: [GameAccountsService, PrismaService],
  exports: [GameAccountsService],
})
export class GameAccountsModule {}
