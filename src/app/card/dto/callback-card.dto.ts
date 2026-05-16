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
}
