import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateMultipleOrderDto {
  @ApiProperty({
    example: ['id-acc-1', 'id-acc-2'],
    description: 'Mảng chứa danh sách các ID tài khoản game muốn mua cùng lúc',
  })
  @IsArray({ message: 'accountIds phải là một mảng các chuỗi' })
  @IsString({
    each: true,
    message: 'Mỗi phần tử trong mảng phải là một chuỗi ID hợp lệ',
  })
  @IsNotEmpty({ message: 'Danh sách ID tài khoản không được để trống' })
  accountIds: string[];
}
