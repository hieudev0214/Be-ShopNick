import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  banner?: string;
}
