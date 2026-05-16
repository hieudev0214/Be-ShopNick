import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @MinLength(6)
  @MaxLength(50)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username chỉ được chứa chữ, số và dấu gạch dưới',
  })
  username?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  zaloPhone?: string;

  @IsOptional()
  @IsString()
  zaloName?: string;
}
