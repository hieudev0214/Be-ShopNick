import { IsBoolean, IsOptional, IsString, IsInt } from 'class-validator';

export class AddGameAccountImageDto {
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
