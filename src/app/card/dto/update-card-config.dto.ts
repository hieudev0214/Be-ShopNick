// src/app/card/dto/update-card-config.dto.ts

import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCardConfigDto {
  @IsString()
  api_url: string;

  @IsString()
  partner_id: string;

  @IsString()
  partner_key: string;

  @IsOptional()
  @IsString()
  callback_url?: string;

  @IsOptional()
  @IsNumber()
  viettel_fee?: number;

  @IsOptional()
  @IsNumber()
  vinaphone_fee?: number;

  @IsOptional()
  @IsNumber()
  mobifone_fee?: number;

  @IsOptional()
  @IsNumber()
  garena_fee?: number;

  @IsOptional()
  @IsNumber()
  zing_fee?: number;

  @IsOptional()
  @IsNumber()
  vnmobi_fee?: number;
}
