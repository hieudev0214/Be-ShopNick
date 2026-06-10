// dto/create-game-account.dto.ts

import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  AccountApprovalStatus,
  AccountPostedByType,
  AccountStatus,
} from '@prisma/client';

import { Type } from 'class-transformer';

export class CreateGameAccountDto {
  @IsString()
  gameID: string;

  @IsOptional()
  @IsString()
  groupID?: string;

  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  categoryGroup?: string;

  @IsString()
  productCode: string;

  @IsOptional()
  @IsString()
  slug?: string;

  // ảnh đại diện
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  detailInfo?: string;

  @IsOptional()
  @IsString()
  accountInfo?: string;

  @IsOptional()
  @IsString()
  productType?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  discountPercent?: number;

  // nhiều ảnh sản phẩm
  @IsOptional()
  @IsArray()
  productImages?: string[];

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @IsEnum(AccountPostedByType)
  postedByType?: AccountPostedByType;

  @IsOptional()
  @IsEnum(AccountApprovalStatus)
  approvalStatus?: AccountApprovalStatus;
}
