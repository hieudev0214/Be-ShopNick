import { IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { GameStatus } from '@prisma/client';

export class CreateGameDto {
  @IsString()
  @Length(1, 150)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 180)
  slug: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;
}
