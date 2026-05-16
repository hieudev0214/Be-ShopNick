import { UserRole, UserStatus } from '@prisma/client';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class GetUserDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '10';
}
