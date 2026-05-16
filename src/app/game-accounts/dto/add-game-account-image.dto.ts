// dto/add-game-account-image.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class AddGameAccountImageDto {
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
