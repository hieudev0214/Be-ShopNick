import { IsNumber, IsString } from 'class-validator';

export class RechargeCardDto {
  @IsString()
  user_id: string;

  @IsString()
  telco: string;

  @IsNumber()
  amount: number;

  @IsString()
  code: string;

  @IsString()
  serial: string;
}
