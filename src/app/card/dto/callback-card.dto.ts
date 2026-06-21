import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CallbackCardDto {
  @IsString()
  request_id: string;

  @IsNumber()
  status: number;

  @IsOptional()
  value?: number;

  @IsOptional()
  @IsString()
  message?: string;

  // --- BỔ SUNG ĐẦY ĐỦ CÁC TRƯỜNG DƯỚI ĐÂY ĐỂ VƯỢT QUA BỘ LỌC BẢO MẬT ---
  @IsOptional()
  @IsNumber()
  declared_value?: number;

  @IsOptional()
  @IsNumber()
  card_value?: number;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  serial?: string;

  @IsOptional()
  @IsString()
  telco?: string;

  @IsOptional()
  @IsNumber()
  trans_id?: number;

  @IsOptional()
  @IsString()
  callback_sign?: string;
}
